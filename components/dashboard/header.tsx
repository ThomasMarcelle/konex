'use client';

import { usePathname } from 'next/navigation';

interface HeaderProps {
  userName: string;
  avatarUrl?: string | null;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Vue d\'ensemble',
  '/dashboard/onboarding': 'Compléter mon profil',
  '/dashboard/marketplace': 'Marketplace',
  '/dashboard/applications': 'Mes candidatures',
  '/dashboard/candidates': 'Candidatures reçues',
  '/dashboard/collaborations': 'Collaborations',
  '/dashboard/messages': 'Messages',
  '/dashboard/settings': 'Paramètres',
};

export default function DashboardHeader({ userName, avatarUrl }: HeaderProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || 'Dashboard';

  // Get initials from name
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 border-b border-white/10 bg-[#020408]/80 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between px-8">
      <h1 className="text-lg font-medium text-white">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">{userName}</span>
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={userName}
            className="w-8 h-8 rounded-full border border-white/20"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border border-white/20 flex items-center justify-center">
            <span className="text-xs font-medium text-white">{initials}</span>
          </div>
        )}
      </div>
    </header>
  );
}

