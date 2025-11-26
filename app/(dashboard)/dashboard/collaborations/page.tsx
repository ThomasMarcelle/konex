import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Handshake, MessageSquare, Building2, Users, ExternalLink, CheckCircle2, Clock, FileText } from 'lucide-react';

const STATUS_CONFIG = {
  active: {
    label: 'En cours',
    icon: Clock,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  completed: {
    label: 'Terminée',
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  cancelled: {
    label: 'Annulée',
    icon: Clock,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
  },
};

export default async function CollaborationsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarding_completed')
    .eq('id', user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect('/dashboard/onboarding');
  }

  const isCreator = profile?.role === 'influencer';

  // Get collaborations based on role
  let collaborations: any[] = [];

  if (isCreator) {
    // Get creator profile
    const { data: creatorProfile } = await supabase
      .from('creator_profiles')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (creatorProfile) {
      const { data } = await supabase
        .from('collaborations')
        .select(`
          *,
          applications:application_id (
            id,
            message,
            saas_companies:saas_id (
              id,
              company_name,
              logo_url,
              industry,
              website,
              commission_rate,
              profiles:profile_id (
                full_name
              )
            )
          ),
          conversations (
            id
          )
        `)
        .eq('applications.creator_id', creatorProfile.id)
        .order('created_at', { ascending: false });

      collaborations = data?.filter(c => c.applications) || [];
    }
  } else {
    // Get SaaS company
    const { data: saasCompany } = await supabase
      .from('saas_companies')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (saasCompany) {
      const { data } = await supabase
        .from('collaborations')
        .select(`
          *,
          applications:application_id (
            id,
            message,
            creator_profiles:creator_id (
              id,
              bio,
              linkedin_url,
              followers_count,
              profiles:profile_id (
                full_name,
                avatar_url
              )
            )
          ),
          conversations (
            id
          )
        `)
        .eq('applications.saas_id', saasCompany.id)
        .order('created_at', { ascending: false });

      collaborations = data?.filter(c => c.applications) || [];
    }
  }

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
        <h2 className="text-2xl font-normal text-white mb-1">Collaborations</h2>
        <p className="text-slate-400 text-sm">
          {isCreator 
            ? 'Gérez vos partenariats avec les entreprises SaaS'
            : 'Gérez vos partenariats avec les créateurs'}
        </p>
      </div>

      {/* Collaborations List */}
      {collaborations.length > 0 ? (
        <div className="space-y-4">
          {collaborations.map((collab) => {
            const status = STATUS_CONFIG[collab.status as keyof typeof STATUS_CONFIG];
            const StatusIcon = status.icon;
            const app = collab.applications;
            const partner = isCreator ? app?.saas_companies : app?.creator_profiles;
            const partnerProfile = isCreator ? partner?.profiles : partner?.profiles;
            const conversation = collab.conversations?.[0];

            return (
              <div 
                key={collab.id}
                className="bg-[#0A0C10] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Partner Avatar/Logo */}
                    {isCreator ? (
                      partner?.logo_url ? (
                        <img 
                          src={partner.logo_url} 
                          alt={partner.company_name}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                          <Building2 className="w-7 h-7 text-blue-400" />
                        </div>
                      )
                    ) : (
                      partnerProfile?.avatar_url ? (
                        <img 
                          src={partnerProfile.avatar_url} 
                          alt={partnerProfile.full_name}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                          <Users className="w-7 h-7 text-purple-400" />
                        </div>
                      )
                    )}

                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-white text-lg">
                          {isCreator ? partner?.company_name : partnerProfile?.full_name}
                        </h3>
                        {isCreator && partner?.website && (
                          <a 
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {isCreator ? (
                          <>
                            <span className="text-xs text-slate-500">{partner?.industry}</span>
                            {partner?.commission_rate && (
                              <span className="text-xs text-green-400">{partner.commission_rate}% commission</span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {partner?.followers_count?.toLocaleString()} followers
                          </span>
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

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-slate-500">
                    Collaboration démarrée le {formatDate(collab.started_at)}
                  </span>
                  
                  <div className="flex gap-3">
                    <Link 
                      href={`/dashboard/collaborations/${collab.id}`}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Voir les posts
                    </Link>
                    {conversation && (
                      <Link 
                        href={`/dashboard/messages?conversation=${conversation.id}`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Messages
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#0A0C10] border border-white/10 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Handshake className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Aucune collaboration</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            {isCreator 
              ? 'Vous n\'avez pas encore de collaboration active. Postulez auprès d\'entreprises SaaS !'
              : 'Vous n\'avez pas encore de collaboration active. Acceptez des candidatures de créateurs !'}
          </p>
          <Link 
            href={isCreator ? '/dashboard/marketplace' : '/dashboard/candidates'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isCreator ? 'Explorer la Marketplace' : 'Voir les candidatures'}
          </Link>
        </div>
      )}
    </div>
  );
}

