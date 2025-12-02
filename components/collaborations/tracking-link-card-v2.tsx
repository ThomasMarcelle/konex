'use client';

import { useState, useEffect } from 'react';
import { Link as LinkIcon, Copy, Check, ExternalLink, TrendingUp, Eye, MousePointerClick, DollarSign } from 'lucide-react';

interface TrackingLinkCardProps {
  hash: string;
  impressions: number;
  clicks: number;
  revenue: number;
  isCreator: boolean;
  trackImpressions: boolean;
  trackClicks: boolean;
  trackRevenue: boolean;
}

export default function TrackingLinkCardV2({ 
  hash, 
  impressions, 
  clicks, 
  revenue,
  isCreator,
  trackImpressions,
  trackClicks,
  trackRevenue
}: TrackingLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Wait for client-side mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Build the full tracking URL (only show full URL after mount)
  const trackingUrl = mounted ? `${window.location.origin}/c/${hash}` : `/c/${hash}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <LinkIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">
              {isCreator ? 'Ton Lien Tracké' : 'Lien Tracké du Créateur'}
            </h3>
            <p className="text-xs text-slate-400">
              {isCreator 
                ? 'Utilise ce lien dans tes posts, bio, et commentaires'
                : 'Lien unique pour suivre le trafic généré'}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Impressions */}
        {trackImpressions && (
          <div className="bg-[#0A0C10] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-medium">Impressions</span>
            </div>
            <div className="text-2xl font-semibold text-white">{impressions.toLocaleString()}</div>
          </div>
        )}

        {/* Clicks */}
        {trackClicks && (
          <div className="bg-[#0A0C10] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <MousePointerClick className="w-4 h-4" />
              <span className="text-xs font-medium">Clics</span>
            </div>
            <div className="text-2xl font-semibold text-blue-400">{clicks.toLocaleString()}</div>
          </div>
        )}

        {/* Revenue */}
        {trackRevenue && (
          <div className="bg-[#0A0C10] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">CA Généré</span>
            </div>
            <div className="text-2xl font-semibold text-green-400">€{revenue.toFixed(2)}</div>
          </div>
        )}
      </div>

      {/* Tracking Link Display */}
      <div className="bg-[#0A0C10] border border-white/10 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 font-mono text-sm text-slate-300 break-all">
            {trackingUrl}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copier
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instructions for Creator */}
      {isCreator && (
        <div className="space-y-2 mb-4">
          <p className="text-sm text-slate-400 font-medium">💡 Comment l'utiliser :</p>
          <ul className="space-y-1.5 text-xs text-slate-500">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Ajoute-le en <strong className="text-slate-400">premier commentaire</strong> de tes posts LinkedIn</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Mets-le dans ta <strong className="text-slate-400">bio LinkedIn</strong> (section "À propos")</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Partage-le en <strong className="text-slate-400">DM</strong> quand on te demande le produit</span>
            </li>
            {trackImpressions && (
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>Les <strong className="text-slate-400">impressions</strong> sont comptées quand le lien est vu</span>
              </li>
            )}
            {trackClicks && (
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>Les <strong className="text-slate-400">clics</strong> sont comptés quand quelqu'un clique</span>
              </li>
            )}
            {trackRevenue && (
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>Le <strong className="text-slate-400">CA</strong> est attribué via cookie de 30 jours 🍪</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Tracking Info */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${trackImpressions ? 'bg-green-400' : 'bg-slate-600'}`} />
            Impressions {trackImpressions ? 'ON' : 'OFF'}
          </span>
          <span className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${trackClicks ? 'bg-green-400' : 'bg-slate-600'}`} />
            Clics {trackClicks ? 'ON' : 'OFF'}
          </span>
          <span className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${trackRevenue ? 'bg-green-400' : 'bg-slate-600'}`} />
            CA {trackRevenue ? 'ON' : 'OFF'}
          </span>
        </div>

        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Tester
        </a>
      </div>
    </div>
  );
}

