'use client';

import { useState } from 'react';
import { Settings, Copy, Check, ChevronDown, ChevronUp, Code, Zap } from 'lucide-react';

interface RevenueTrackingSetupProps {
  apiKey?: string;
  trackingDomain?: string;
}

export default function RevenueTrackingSetup({ 
  apiKey = 'Générer dans Paramètres', 
  trackingDomain = 'https://naano.com' 
}: RevenueTrackingSetupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedPixel, setCopiedPixel] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const pixelCode = `<!-- Naano Conversion Tracking - Ajouter sur votre page de confirmation -->
<script>
  fetch('${trackingDomain}/api/track/conversion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ 
      revenue: MONTANT_ACHAT,  // Remplacer par le montant réel
      order_id: 'ID_COMMANDE'  // Optionnel
    })
  });
</script>`;

  const webhookCode = `// Côté serveur - Après un achat réussi
fetch('${trackingDomain}/api/track/conversion', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ 
    session_id: req.query.naano_session, // Récupéré de l'URL
    revenue: order.total,
    order_id: order.id
  })
});`;

  const copyToClipboard = (text: string, type: 'pixel' | 'webhook') => {
    navigator.clipboard.writeText(text);
    if (type === 'pixel') {
      setCopiedPixel(true);
      setTimeout(() => setCopiedPixel(false), 2000);
    } else {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Settings className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-medium text-white">Configuration du suivi CA</h3>
            <p className="text-sm text-slate-400">Suivez le chiffre d'affaires généré par ce créateur</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Expandable Content */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          <div className="h-px bg-white/10" />
          
          <p className="text-sm text-slate-300">
            Pour tracker le CA généré, ajoutez <strong>une</strong> des options suivantes à votre site :
          </p>

          {/* Option 1: Pixel */}
          <div className="bg-[#0A0C10] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="font-medium text-white">Option 1 : Pixel (Facile)</span>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Recommandé</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Ajoutez ce code sur votre page de confirmation d'achat :
            </p>
            <div className="relative">
              <pre className="bg-black/50 rounded-lg p-3 text-xs text-slate-300 overflow-x-auto">
                {pixelCode}
              </pre>
              <button
                onClick={() => copyToClipboard(pixelCode, 'pixel')}
                className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
              >
                {copiedPixel ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Option 2: Webhook */}
          <div className="bg-[#0A0C10] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-blue-400" />
              <span className="font-medium text-white">Option 2 : Webhook (Précis)</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Appelez notre API depuis votre serveur après chaque achat :
            </p>
            <div className="relative">
              <pre className="bg-black/50 rounded-lg p-3 text-xs text-slate-300 overflow-x-auto">
                {webhookCode}
              </pre>
              <button
                onClick={() => copyToClipboard(webhookCode, 'webhook')}
                className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
              >
                {copiedWebhook ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Help text */}
          <p className="text-xs text-slate-500">
            💡 Le Pixel est plus simple mais ne fonctionne pas en navigation privée. 
            Le Webhook est plus précis et fonctionne partout.
          </p>
        </div>
      )}
    </div>
  );
}

