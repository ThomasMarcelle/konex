'use client';

import { useState, useEffect } from 'react';
import { Linkedin, ExternalLink, Loader2 } from 'lucide-react';

interface LinkedInPreviewProps {
  url: string;
}

export default function LinkedInPreview({ url }: LinkedInPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Extract post ID from URL for embed
  const getEmbedUrl = (linkedinUrl: string) => {
    // LinkedIn doesn't provide a simple embed, so we'll show a styled preview
    // with a link to open the actual post
    return linkedinUrl;
  };

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [url]);

  if (isLoading) {
    return (
      <div className="bg-[#020408] border border-white/10 rounded-xl p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="bg-[#020408] border border-white/10 rounded-xl overflow-hidden">
      {/* LinkedIn Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5">
        <div className="w-10 h-10 rounded-lg bg-[#0A66C2] flex items-center justify-center">
          <Linkedin className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-white">Post LinkedIn</div>
          <div className="text-xs text-slate-500 truncate max-w-md">{url}</div>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg text-sm transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Voir
        </a>
      </div>

      {/* Preview Content */}
      <div className="p-4">
        <div className="aspect-video bg-gradient-to-br from-[#0A66C2]/10 to-blue-500/5 rounded-lg flex flex-col items-center justify-center border border-white/5">
          <Linkedin className="w-12 h-12 text-[#0A66C2] mb-3" />
          <p className="text-slate-400 text-sm text-center max-w-xs">
            Cliquez sur "Voir" pour ouvrir le post LinkedIn dans un nouvel onglet
          </p>
        </div>
      </div>

      {/* Embed iframe (LinkedIn oEmbed) */}
      <div className="px-4 pb-4">
        <iframe
          src={`https://www.linkedin.com/embed/feed/update/${extractPostId(url)}`}
          height="400"
          width="100%"
          frameBorder="0"
          allowFullScreen
          title="LinkedIn Post"
          className="rounded-lg bg-white"
          onError={() => setError(true)}
          style={{ display: error ? 'none' : 'block' }}
        />
        {error && (
          <div className="text-center py-8 text-slate-500 text-sm">
            Impossible de charger l'aperçu. Le post est peut-être privé.
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to extract post ID from LinkedIn URL
function extractPostId(url: string): string {
  // URLs can be:
  // https://www.linkedin.com/posts/username_activity-1234567890-xxxx
  // https://www.linkedin.com/feed/update/urn:li:activity:1234567890
  // https://www.linkedin.com/feed/update/urn:li:share:1234567890
  
  try {
    if (url.includes('activity-')) {
      const match = url.match(/activity-(\d+)/);
      if (match) return `urn:li:activity:${match[1]}`;
    }
    
    if (url.includes('urn:li:activity:')) {
      const match = url.match(/urn:li:activity:(\d+)/);
      if (match) return `urn:li:activity:${match[1]}`;
    }
    
    if (url.includes('urn:li:share:')) {
      const match = url.match(/urn:li:share:(\d+)/);
      if (match) return `urn:li:share:${match[1]}`;
    }

    // Try to extract from ugcPost format
    if (url.includes('ugcPost')) {
      const match = url.match(/ugcPost:(\d+)/);
      if (match) return `urn:li:ugcPost:${match[1]}`;
    }

    return '';
  } catch {
    return '';
  }
}

