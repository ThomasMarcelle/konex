'use client';

import { useState } from 'react';
import { completeSaasOnboarding, uploadMediaPack } from '@/app/(dashboard)/actions';
import { Loader2, AlertCircle, Upload, CheckCircle2, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const INDUSTRIES = [
  'SaaS / Logiciel',
  'Fintech',
  'E-commerce',
  'Marketing',
  'Ressources Humaines',
  'Productivité',
  'Cybersécurité',
  'IA / Machine Learning',
  'EdTech',
  'HealthTech',
  'Autre',
];

export default function SaasOnboardingForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaPackUrl, setMediaPackUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadMediaPack(formData);
    
    if (result.error) {
      setError(result.error);
    } else if (result.url) {
      setMediaPackUrl(result.url);
    }
    setIsUploading(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    if (mediaPackUrl) {
      formData.append('mediaPackUrl', mediaPackUrl);
    }

    const result = await completeSaasOnboarding(formData);

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
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Nom de l'entreprise *
          </label>
          <input
            name="companyName"
            type="text"
            required
            placeholder="Acme Inc."
            className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description du produit *
          </label>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Décrivez votre produit/service et ce que vous recherchez chez les créateurs..."
            className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Site web
          </label>
          <input
            name="website"
            type="url"
            placeholder="https://www.example.com"
            className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Industrie *
          </label>
          <select
            name="industry"
            required
            className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          >
            <option value="">Sélectionnez une industrie</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Commission Rate */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Taux de commission proposé (%) *
          </label>
          <div className="relative">
            <input
              name="commissionRate"
              type="number"
              required
              min="0"
              max="100"
              step="0.5"
              placeholder="15"
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            Commission versée aux créateurs sur les ventes générées
          </p>
        </div>

        {/* Conditions */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Conditions de collaboration
          </label>
          <textarea
            name="conditions"
            rows={3}
            placeholder="Durée minimale, exclusivité, attentes spécifiques..."
            className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
          />
        </div>

        {/* Media Pack Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Media Pack (logos, guidelines)
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".pdf,.zip,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
              id="media-pack-upload"
            />
            <label
              htmlFor="media-pack-upload"
              className={`flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                mediaPackUrl
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-white/10 hover:border-white/20 bg-[#0A0C10]'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span className="text-slate-400">Upload en cours...</span>
                </>
              ) : mediaPackUrl ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">Fichier uploadé</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-slate-500" />
                  <span className="text-slate-400">Cliquez pour uploader (PDF, ZIP, images)</span>
                </>
              )}
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Building2 className="w-5 h-5" />
            Créer mon profil entreprise
          </>
        )}
      </button>
    </form>
  );
}

