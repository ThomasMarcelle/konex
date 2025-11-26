'use client';

import { useState } from 'react';
import { signup } from '@/app/(auth)/actions';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'saas' | 'influencer'>('saas');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(event.currentTarget);
    formData.append('role', role);

    const result = await signup(formData);

    if (result?.error) {
        setError(result.error);
        setIsLoading(false);
    } else {
        setSuccess(true);
        setIsLoading(false);
    }
  }

  if (success) {
    return (
        <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Vérifiez vos emails</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                Un lien de confirmation a été envoyé à votre adresse email. Cliquez dessus pour activer votre compte.
            </p>
        </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
        </div>
      )}

      {/* Role Selection */}
      <div className="grid grid-cols-2 gap-3 p-1 bg-white/5 rounded-xl border border-white/10">
        <button
            type="button"
            onClick={() => setRole('saas')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                role === 'saas' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
        >
            Entreprise
        </button>
        <button
            type="button"
            onClick={() => setRole('influencer')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                role === 'influencer' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
        >
            Créateur
        </button>
      </div>

      <div className="space-y-4">
        <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Nom complet</label>
            <input 
                name="fullName" 
                type="text" 
                required 
                placeholder="John Doe"
                className="w-full bg-[#020408] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
        </div>
        
        <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Email professionnel</label>
            <input 
                name="email" 
                type="email" 
                required 
                placeholder="john@company.com"
                className="w-full bg-[#020408] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
        </div>

        <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Mot de passe</label>
            <input 
                name="password" 
                type="password" 
                required 
                placeholder="••••••••"
                minLength={8}
                className="w-full bg-[#020408] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full h-11 mt-2 bg-white text-slate-950 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
            <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Création en cours...
            </>
        ) : (
            "Créer mon compte"
        )}
      </button>
    </form>
  );
}

