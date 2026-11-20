import React, { useState } from 'react';
import { Volume2, VolumeX, Globe, Settings, Users } from 'lucide-react';
import type { AudioSettings, Language } from '../types/game';
import { t } from '../i18n/translations';
import { DiwanLogo } from './icons/GameIcons';
import { PWAInstallButton } from './PWAInstallButton';
import { soundEngine } from '../utils/soundEngine';

export type AppView = 'home' | 'games' | 'friends' | 'rooms' | 'profile' | 'settings' | 'playing';

interface TopNavProps {
  lang: Language;
  onToggleLang: () => void;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  audio: AudioSettings;
  onUpdateAudio: (patch: Partial<AudioSettings>) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  lang,
  onToggleLang,
  activeView,
  onNavigate,
  audio,
  onUpdateAudio,
}) => {
  const copy = t(lang);
  const [audioOpen, setAudioOpen] = useState(false);

  const handleNavClick = (view: AppView) => {
    soundEngine.playNavigate();
    setAudioOpen(false);
    onNavigate(view);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F4]/95 dark:bg-[#141210]/95 border-b border-[#E5DEC9] dark:border-[#2E2822] backdrop-blur-sm">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#C84B31] rounded-lg cursor-pointer"
        >
          <DiwanLogo className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="font-display text-base sm:text-lg font-bold tracking-tight text-[#1C1917] dark:text-[#F5F2EB]">
            {copy.brand}
          </span>
        </button>

        {/* Utility Controls & Rooms */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
          <PWAInstallButton lang={lang} variant="compact" />

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onToggleLang();
            }}
            aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            className="h-9 px-2 sm:px-2.5 rounded-lg border border-[#E5DEC9] dark:border-[#342E28] bg-white dark:bg-[#1E1B18] hover:bg-[#F1ECE2] dark:hover:bg-[#2A2520] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] flex items-center gap-1 whitespace-nowrap shrink-0 tactile-btn cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#57534E] dark:text-[#B8AFA3]" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setAudioOpen((v) => !v);
            }}
            aria-label={copy.audio.title}
            className="h-9 w-9 rounded-lg border border-[#E5DEC9] dark:border-[#342E28] bg-white dark:bg-[#1E1B18] hover:bg-[#F1ECE2] dark:hover:bg-[#2A2520] flex items-center justify-center text-[#1C1917] dark:text-[#F5F2EB] shrink-0 tactile-btn cursor-pointer"
          >
            {audio.muted ? (
              <VolumeX className="w-4 h-4 text-[#C84B31]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('settings')}
            aria-label={copy.nav.settings}
            title={copy.nav.settings}
            className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 tactile-btn cursor-pointer ${
              activeView === 'settings'
                ? 'border-[#C84B31] bg-[#C84B31]/10 text-[#C84B31]'
                : 'border-[#E5DEC9] dark:border-[#342E28] bg-white dark:bg-[#1E1B18] hover:bg-[#F1ECE2] dark:hover:bg-[#2A2520] text-[#57534E] dark:text-[#B8AFA3]'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('rooms')}
            className={`h-9 px-2.5 sm:px-3.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 tactile-btn cursor-pointer flex items-center gap-1.5 ${
              activeView === 'rooms'
                ? 'bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917]'
                : 'bg-[#C84B31] hover:bg-[#B03E26] text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 hidden sm:block" />
            <span>{copy.actions.createRoom}</span>
          </button>

          {audioOpen && (
            <div className="absolute top-12 end-0 w-60 p-4 rounded-2xl bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] shadow-xl z-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                  {copy.audio.title}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateAudio({ muted: !audio.muted })}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md cursor-pointer ${
                    audio.muted
                      ? 'bg-[#C84B31]/12 text-[#C84B31] dark:text-[#F87171]'
                      : 'bg-[#2D6A4F]/12 text-[#2D6A4F] dark:text-[#52B788]'
                  }`}
                >
                  {audio.muted ? copy.audio.unmute : copy.audio.muteAll}
                </button>
              </div>
              <div className="text-xs">
                <div className="flex justify-between mb-1 text-[#57534E] dark:text-[#B8AFA3]">
                  <span>{copy.audio.sfx}</span>
                  <span className="tabular-nums">
                    {audio.muted ? '0%' : `${Math.round(audio.sfxVolume * 100)}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(audio.sfxVolume * 100)}
                  onChange={(e) =>
                    onUpdateAudio({ sfxVolume: Number(e.target.value) / 100, muted: false })
                  }
                  className="w-full accent-[#C84B31]"
                  aria-label={copy.audio.sfx}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
