import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Users, Linkedin, ExternalLink } from 'lucide-react';
import CandidateCard from '@/components/candidates/candidate-card';

export default async function CandidatesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarding_completed')
    .eq('id', user.id)
    .single();

  // Only SaaS should access this page
  if (profile?.role !== 'saas') {
    redirect('/dashboard');
  }

  if (!profile?.onboarding_completed) {
    redirect('/dashboard/onboarding');
  }

  // Get SaaS company
  const { data: saasCompany } = await supabase
    .from('saas_companies')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (!saasCompany) {
    redirect('/dashboard/onboarding');
  }

  // Get applications with creator details
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      creator_profiles:creator_id (
        id,
        bio,
        linkedin_url,
        followers_count,
        engagement_rate,
        expertise_sectors,
        hourly_rate,
        profiles:profile_id (
          id,
          full_name,
          avatar_url,
          email
        )
      )
    `)
    .eq('saas_id', saasCompany.id)
    .order('created_at', { ascending: false });

  const pendingApplications = applications?.filter(a => a.status === 'pending') || [];
  const processedApplications = applications?.filter(a => a.status !== 'pending') || [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-normal text-white mb-1">Candidatures reçues</h2>
        <p className="text-slate-400 text-sm">
          Gérez les candidatures des créateurs souhaitant collaborer avec vous
        </p>
      </div>

      {/* Pending Applications */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          En attente
          {pendingApplications.length > 0 && (
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
              {pendingApplications.length}
            </span>
          )}
        </h3>

        {pendingApplications.length > 0 ? (
          <div className="space-y-4">
            {pendingApplications.map((application) => (
              <CandidateCard
                key={application.id}
                application={application as any}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#0A0C10] border border-white/10 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm">Aucune candidature en attente</p>
          </div>
        )}
      </div>

      {/* Processed Applications */}
      {processedApplications.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Historique</h3>
          <div className="space-y-4 opacity-60">
            {processedApplications.map((application) => (
              <CandidateCard
                key={application.id}
                application={application as any}
                readonly
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

