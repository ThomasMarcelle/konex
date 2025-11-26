'use client';

import { useState } from 'react';
import { Building2, Globe, Percent, ExternalLink, Send } from 'lucide-react';
import type { SaasCompanyWithProfile } from '@/types/database';
import ApplyModal from './apply-modal';

interface SaasCardProps {
  company: SaasCompanyWithProfile;
  hasApplied: boolean;
  creatorProfileId: string | null;
}

export default function SaasCard({ company, hasApplied, creatorProfileId }: SaasCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [applied, setApplied] = useState(hasApplied);

  return (
    <>
      <div className="bg-[#0A0C10] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {company.logo_url ? (
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
              <h3 className="font-medium text-white text-lg">{company.company_name}</h3>
              <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                {company.industry || 'Non spécifié'}
              </span>
            </div>
          </div>
          {company.website && (
            <a 
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-white transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>

        {/* Description */}
        <p className="text-slate-400 text-sm mb-4 line-clamp-3">
          {company.description || 'Aucune description disponible.'}
        </p>

        {/* Commission Badge */}
        {company.commission_rate && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg">
              <Percent className="w-4 h-4" />
              <span className="text-sm font-medium">{company.commission_rate}% commission</span>
            </div>
          </div>
        )}

        {/* Conditions Preview */}
        {company.conditions && (
          <div className="text-xs text-slate-500 mb-4 p-3 bg-white/[0.02] rounded-lg border border-white/5">
            <span className="font-medium text-slate-400">Conditions :</span> {company.conditions.slice(0, 100)}
            {company.conditions.length > 100 && '...'}
          </div>
        )}

        {/* Action Button */}
        {creatorProfileId ? (
          applied ? (
            <button 
              disabled
              className="w-full py-2.5 bg-white/5 text-slate-500 rounded-xl text-sm font-medium cursor-not-allowed"
            >
              Candidature envoyée
            </button>
          ) : (
            <button 
              onClick={() => setShowModal(true)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Postuler
            </button>
          )
        ) : (
          <div className="text-xs text-center text-slate-500 py-2">
            Complétez votre profil créateur pour postuler
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showModal && (
        <ApplyModal 
          company={company}
          creatorProfileId={creatorProfileId!}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setApplied(true);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

