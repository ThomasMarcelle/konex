import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Clock, CheckCircle2, XCircle, Building2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG = {
  pending: {
    label: 'En attente',
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  accepted: {
    label: 'Acceptée',
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  rejected: {
    label: 'Refusée',
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
};

export default async function ApplicationsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarding_completed')
    .eq('id', user.id)
    .single();

  // Only creators should access this page
  if (profile?.role !== 'influencer') {
    redirect('/dashboard');
  }

  if (!profile?.onboarding_completed) {
    redirect('/dashboard/onboarding');
  }

  // Get creator profile
  const { data: creatorProfile } = await supabase
    .from('creator_profiles')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (!creatorProfile) {
    redirect('/dashboard/onboarding');
  }

  // Get applications with SaaS company details
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      saas_companies:saas_id (
        id,
        company_name,
        logo_url,
        industry,
        website,
        commission_rate
      )
    `)
    .eq('creator_id', creatorProfile.id)
    .order('created_at', { ascending: false });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-normal text-white mb-1">Mes candidatures</h2>
        <p className="text-slate-400 text-sm">
          Suivez l'état de vos candidatures auprès des entreprises SaaS
        </p>
      </div>

      {/* Applications List */}
      {applications && applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application) => {
            const status = STATUS_CONFIG[application.status as keyof typeof STATUS_CONFIG];
            const StatusIcon = status.icon;
            const company = application.saas_companies;

            return (
              <div 
                key={application.id}
                className="bg-[#0A0C10] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {company?.logo_url ? (
                      <img 
                        src={company.logo_url} 
                        alt={company.company_name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-blue-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-white text-lg">{company?.company_name}</h3>
                        {company?.website && (
                          <a 
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">{company?.industry}</span>
                        {company?.commission_rate && (
                          <span className="text-xs text-green-400">{company.commission_rate}% commission</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${status.bg} ${status.border} border`}>
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                  </div>
                </div>

                {/* Message Preview */}
                {application.message && (
                  <div className="mt-4 p-3 bg-white/[0.02] rounded-lg border border-white/5">
                    <p className="text-sm text-slate-400 line-clamp-2">{application.message}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Candidature envoyée le {formatDate(application.created_at)}
                  </span>
                  
                  {application.status === 'accepted' && (
                    <Link 
                      href="/dashboard/collaborations"
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Voir la collaboration →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#0A0C10] border border-white/10 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Aucune candidature</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Vous n'avez pas encore postulé auprès d'entreprises SaaS.
          </p>
          <Link 
            href="/dashboard/marketplace"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Explorer la Marketplace
          </Link>
        </div>
      )}
    </div>
  );
}

