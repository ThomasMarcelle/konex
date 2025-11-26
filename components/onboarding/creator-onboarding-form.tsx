'use client';

import { useState } from 'react';
import { completeCreatorOnboarding } from '@/app/(dashboard)/actions';
import { Loader2, AlertCircle, Linkedin, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

const EXPERTISE_SECTORS = [
  'Tech / SaaS',
  'Marketing Digital',
  'Finance / Fintech',
  'Entrepreneuriat',
  'Productivité',
  'Leadership',
  'Ventes / Sales',
  'Ressources Humaines',
  'Data / Analytics',
  'Design / UX',
  'IA / Innovation',
  'Autre',
];

export default function CreatorOnboardingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  function toggleSector(sector: string) {
    setSelectedSectors((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.append('expertiseSectors', selectedSectors.join(','));

    const result = await completeCreatorOnboarding(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Bio *
          </label>
          <textarea
            name="bio"
            required
            rows={4}
            placeholder="Présentez-vous en quelques lignes : votre parcours, votre expertise, ce qui vous passionne..."
            className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
          />
        </div>

        {/* LinkedIn URL */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Profil LinkedIn *
          </label>
          <div className="relative">
            <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              name="linkedinUrl"
              type="url"
              required
              placeholder="https://linkedin.com/in/votre-profil"
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Followers Count */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nombre de followers *
            </label>
            <input
              name="followersCount"
              type="number"
              required
              min="0"
              placeholder="5000"
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>

          {/* Engagement Rate */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Taux d'engagement (%)
            </label>
            <div className="relative">
              <input
                name="engagementRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="3.5"
                className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
            </div>
          </div>
        </div>

        {/* Expertise Sectors */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Secteurs d'expertise
          </label>
          <div className="flex flex-wrap gap-2">
            {EXPERTISE_SECTORS.map((sector) => (
              <button
                key={sector}
                type="button"
                onClick={() => toggleSector(sector)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedSectors.includes(sector)
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        {/* Hourly Rate */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tarif indicatif (€/post)
          </label>
          <div className="relative">
            <input
              name="hourlyRate"
              type="number"
              min="0"
              placeholder="150"
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">€</span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            Prix moyen que vous facturez pour un post LinkedIn sponsorisé
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Users className="w-5 h-5" />
            Créer mon profil créateur
          </>
        )}
      </button>
    </form>
  );
}

