import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Hexagon, Building2, Users } from 'lucide-react';
import SaasOnboardingForm from '@/components/onboarding/saas-onboarding-form';
import CreatorOnboardingForm from '@/components/onboarding/creator-onboarding-form';

export default async function OnboardingPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get user profile to check role and onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarding_completed')
    .eq('id', user.id)
    .single();

  // If onboarding is already completed, redirect to dashboard
  if (profile?.onboarding_completed) {
    redirect('/dashboard');
  }

  const isCreator = profile?.role === 'influencer';

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative flex items-center justify-center">
              <Hexagon className="w-12 h-12 text-blue-500 fill-blue-500/10 stroke-[1.5]" />
            </div>
          </div>
          
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
            isCreator 
              ? 'bg-purple-500/10 border border-purple-500/20' 
              : 'bg-blue-500/10 border border-blue-500/20'
          }`}>
            {isCreator ? (
              <>
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-400">Profil Créateur</span>
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">Profil Entreprise</span>
              </>
            )}
          </div>

          <h1 className="text-2xl font-medium text-white mb-2">
            Complétez votre profil
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {isCreator 
              ? 'Présentez-vous aux entreprises SaaS et montrez votre expertise LinkedIn.'
              : 'Décrivez votre entreprise et vos offres pour attirer les meilleurs créateurs.'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#0A0C10] border border-white/10 rounded-2xl p-8">
          {isCreator ? <CreatorOnboardingForm /> : <SaasOnboardingForm />}
        </div>
      </div>
    </div>
  );
}

