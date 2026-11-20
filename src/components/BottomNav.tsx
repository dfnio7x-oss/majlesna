import React from 'react';
import { Gamepad2, Home, Users } from 'lucide-react';
import type { Language, PlayerProfile } from '../types/game';
import { t } from '../i18n/translations';
import { AvatarSvg } from './icons/GameIcons';
import { soundEngine } from '../utils/soundEngine';
import type { AppView } from './TopNav';

interface BottomNavProps {
  lang: Language;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  profile: PlayerProfile;
  pendingRequestsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  lang,
  activeView,
  onNavigate,
  profile,
  pendingRequestsCount = 0,
}) => {
  const copy = t(lang);

  const handleNavClick = (view: AppView) => {
    soundEngine.playNavigate();
    onNavigate(view);
  };

  return (
    <div className="fixed bottom-3 sm:bottom-4 inset-x-0 z-40 px-3 sm:px-6 pointer-events-none">
      <nav
        aria-label={lang === 'ar' ? 'التنقل الرئيسي' : 'Bottom navigation'}
        className="pointer-events-auto mx-auto w-full max-w-[560px] rounded-[22px] bg-[#FAF8F4]/95 dark:bg-[#1E1B18]/95 backdrop-blur-md border border-[#E5DEC9] dark:border-[#342E28] shadow-[0_12px_32px_-12px_rgba(28,25,23,0.22)] dark:shadow-[0_14px_34px_-10px_rgba(0,0,0,0.65)] p-1.5 grid grid-cols-4 gap-1"
      >
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          aria-current={activeView === 'home' ? 'page' : undefined}
          className={`min-h-[52px] px-2 py-1.5 rounded-[16px] flex flex-col items-center justify-center gap-1 text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeView === 'home'
              ? 'bg-[#C84B31] text-white'
              : 'text-[#57534E] dark:text-[#B8AFA3] hover:bg-[#F1ECE2] dark:hover:bg-[#2A2520] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]'
          }`}
        >
          <Home className="w-4 h-4 shrink-0" />
          <span className="truncate max-w-full">{copy.nav.home}</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('games')}
          aria-current={activeView === 'games' ? 'page' : undefined}
          className={`min-h-[52px] px-2 py-1.5 rounded-[16px] flex flex-col items-center justify-center gap-1 text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeView === 'games'
              ? 'bg-[#C84B31] text-white'
              : 'text-[#57534E] dark:text-[#B8AFA3] hover:bg-[#F1ECE2] dark:hover:bg-[#2A2520] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]'
          }`}
        >
          <Gamepad2 className="w-4 h-4 shrink-0" />
          <span className="truncate max-w-full">{copy.nav.games}</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('friends')}
          aria-current={activeView === 'friends' ? 'page' : undefined}
          className={`relative min-h-[52px] px-2 py-1.5 rounded-[16px] flex flex-col items-center justify-center gap-1 text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeView === 'friends'
              ? 'bg-[#C84B31] text-white'
              : 'text-[#57534E] dark:text-[#B8AFA3] hover:bg-[#F1ECE2] dark:hover:bg-[#2A2520] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]'
          }`}
        >
          <div className="relative">
            <Users className="w-4 h-4 shrink-0" />
            {pendingRequestsCount > 0 && (
              <span
                className={`absolute -top-1.5 -end-2.5 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-mono-tabular font-bold flex items-center justify-center ${
                  activeView === 'friends'
                    ? 'bg-white text-[#C84B31]'
                    : 'bg-[#C84B31] text-white'
                }`}
              >
                {pendingRequestsCount}
              </span>
            )}
          </div>
          <span className="truncate max-w-full">{copy.nav.friends}</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('profile')}
          aria-current={activeView === 'profile' ? 'page' : undefined}
          className={`min-h-[52px] px-2 py-1.5 rounded-[16px] flex flex-col items-center justify-center gap-1 text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeView === 'profile'
              ? 'bg-[#C84B31] text-white'
              : 'text-[#57534E] dark:text-[#B8AFA3] hover:bg-[#F1ECE2] dark:hover:bg-[#2A2520] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]'
          }`}
        >
          <AvatarSvg
            avatarId={profile.avatarId}
            customAvatarUrl={profile.customAvatarUrl}
            accentColor={profile.accentColor}
            size={20}
          />
          <span className="truncate max-w-full">{copy.nav.profile}</span>
        </button>
      </nav>
    </div>
  );
};
