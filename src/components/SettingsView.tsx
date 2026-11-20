import React from 'react';
import { Globe, Monitor, Moon, Play, Sun, Volume2, VolumeX } from 'lucide-react';
import type { AudioSettings, Language, ThemeMode } from '../types/game';
import { t } from '../i18n/translations';
import { soundEngine } from '../utils/soundEngine';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsViewProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  audio: AudioSettings;
  onUpdateAudio: (patch: Partial<AudioSettings>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang,
  onChangeLang,
  theme,
  onChangeTheme,
  audio,
  onUpdateAudio,
}) => {
  const copy = t(lang);

  const themes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: copy.settings.themeLight, icon: <Sun className="w-4 h-4" /> },
    { id: 'dark', label: copy.settings.themeDark, icon: <Moon className="w-4 h-4" /> },
    { id: 'system', label: copy.settings.themeSystem, icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <main className="max-w-[920px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
          {copy.settings.title}
        </h1>
        <p className="text-sm text-[#57534E] dark:text-[#B8AFA3] mt-1">
          {copy.settings.subtitle}
        </p>
      </div>

      {/* 1. Language */}
      <section className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2B4C7E]/12 text-[#2B4C7E] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB]">
              {copy.settings.langSectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#B8AFA3] mt-0.5">
              {copy.settings.langSectionDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              soundEngine.playSelect();
              onChangeLang('ar');
            }}
            className={`h-12 px-4 rounded-xl border text-sm font-semibold flex items-center justify-between tactile-btn cursor-pointer ${
              lang === 'ar'
                ? 'border-[#C84B31] bg-[#C84B31]/8 text-[#C84B31] dark:text-[#F87171]'
                : 'border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] text-[#1C1917] dark:text-[#F5F2EB]'
            }`}
          >
            <span>{copy.settings.langAr}</span>
            <span className="font-mono-tabular text-xs opacity-75">RTL</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSelect();
              onChangeLang('en');
            }}
            className={`h-12 px-4 rounded-xl border text-sm font-semibold flex items-center justify-between tactile-btn cursor-pointer ${
              lang === 'en'
                ? 'border-[#C84B31] bg-[#C84B31]/8 text-[#C84B31] dark:text-[#F87171]'
                : 'border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] text-[#1C1917] dark:text-[#F5F2EB]'
            }`}
          >
            <span>{copy.settings.langEn}</span>
            <span className="font-mono-tabular text-xs opacity-75">LTR</span>
          </button>
        </div>
      </section>

      {/* 2. Appearance */}
      <section className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D97706]/12 text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center shrink-0">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB]">
              {copy.settings.appearanceTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#B8AFA3] mt-0.5">
              {copy.settings.appearanceDesc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((item) => {
            const active = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundEngine.playSelect();
                  onChangeTheme(item.id);
                }}
                className={`h-12 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 tactile-btn cursor-pointer ${
                  active
                    ? 'border-[#C84B31] bg-[#C84B31] text-white'
                    : 'border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] text-[#1C1917] dark:text-[#F5F2EB] hover:bg-[#F1ECE2] dark:hover:bg-[#2C2722]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Sound Effects */}
      <section className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/12 text-[#2D6A4F] dark:text-[#52B788] flex items-center justify-center shrink-0">
              {audio.muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                {copy.settings.soundTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#B8AFA3] mt-0.5">
                {copy.settings.soundDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onUpdateAudio({ muted: !audio.muted });
            }}
            className={`h-9 px-3.5 rounded-xl text-xs font-semibold tactile-btn cursor-pointer shrink-0 ${
              audio.muted
                ? 'bg-[#C84B31]/12 text-[#C84B31] dark:text-[#F87171]'
                : 'bg-[#2D6A4F]/12 text-[#2D6A4F] dark:text-[#52B788]'
            }`}
          >
            {audio.muted ? copy.audio.unmute : copy.audio.muteAll}
          </button>
        </div>

        {/* SFX Slider */}
        <div className="p-4 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{copy.audio.sfx}</span>
            <span className="font-mono-tabular text-xs font-bold text-[#57534E] dark:text-[#B8AFA3]">
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
            aria-label={copy.audio.sfx}
            className="w-full accent-[#C84B31] cursor-pointer"
          />
        </div>

        {/* Live Sound Preview */}
        <div className="pt-4 border-t border-[#F1ECE2] dark:border-[#342E28] space-y-2.5">
          <p className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
            {copy.settings.previewTitle}
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => soundEngine.playClick()}
              className="h-9 px-3.5 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-[#F1ECE2] dark:hover:bg-[#2E2924] text-xs font-semibold flex items-center gap-1.5 tactile-btn cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#C84B31]" />
              {copy.settings.previewClick}
            </button>
            <button
              type="button"
              onClick={() => soundEngine.playPoint()}
              className="h-9 px-3.5 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-[#F1ECE2] dark:hover:bg-[#2E2924] text-xs font-semibold flex items-center gap-1.5 tactile-btn cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#2D6A4F]" />
              {copy.settings.previewPoint}
            </button>
            <button
              type="button"
              onClick={() => soundEngine.playWin()}
              className="h-9 px-3.5 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-[#F1ECE2] dark:hover:bg-[#2E2924] text-xs font-semibold flex items-center gap-1.5 tactile-btn cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#D97706]" />
              {copy.settings.previewWin}
            </button>
          </div>
        </div>
      </section>

      <PWAInstallButton lang={lang} variant="card" />

      <p className="text-xs text-center text-[#8C8478] dark:text-[#9D9386]">
        {copy.settings.autoSavedNotice}
      </p>
    </main>
  );
};
