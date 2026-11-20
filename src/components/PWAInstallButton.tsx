import React, { useEffect, useState } from 'react';
import { Download, Share, WifiOff, X } from 'lucide-react';
import type { Language } from '../types/game';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { soundEngine } from '../utils/soundEngine';

export const PWAInstallButton: React.FC<{
  lang: Language;
  variant?: 'compact' | 'card';
}> = ({ lang, variant = 'compact' }) => {
  const { isInstalled, isIOS, canShowInstallOption, triggerInstall } = usePWAInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);

  if (isInstalled || !canShowInstallOption) {
    return null;
  }

  const handleClick = async () => {
    soundEngine.playClick();
    const result = await triggerInstall();
    if (result === 'ios' || (result === 'unavailable' && isIOS)) {
      setShowIosGuide(true);
    }
  };

  return (
    <>
      {variant === 'compact' ? (
        <button
          type="button"
          onClick={handleClick}
          aria-label={lang === 'ar' ? 'تثبيت التطبيق' : 'Install App'}
          title={lang === 'ar' ? 'تثبيت تطبيق مجلسنا' : 'Install Majlisna App'}
          className="h-9 px-2.5 rounded-lg border border-[#E5DEC9] dark:border-[#342E28] bg-white dark:bg-[#1E1B18] hover:bg-[#F1ECE2] dark:hover:bg-[#2A2520] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] flex items-center gap-1.5 whitespace-nowrap shrink-0 tactile-btn cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#C84B31]" />
          <span className="hidden md:inline">{lang === 'ar' ? 'تثبيت التطبيق' : 'Install App'}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="w-full h-11 px-4 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-sm font-semibold flex items-center justify-center gap-2 tactile-btn cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{lang === 'ar' ? 'تثبيت تطبيق مجلسنا على جهازك' : 'Install Majlisna App on Your Device'}</span>
        </button>
      )}

      {showIosGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'ar' ? 'تثبيت على آيفون' : 'Install on iOS'}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                {lang === 'ar' ? 'تثبيت مجلسنا على iPhone / iPad' : 'Install Majlisna on iOS'}
              </h3>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                aria-label={lang === 'ar' ? 'إغلاق' : 'Close'}
                className="w-8 h-8 rounded-lg border border-[#E5DEC9] dark:border-[#342E28] flex items-center justify-center text-[#57534E] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ol className="space-y-2.5 text-sm text-[#57534E] dark:text-[#B8AFA3] leading-relaxed">
              <li className="flex items-center gap-2">
                <Share className="w-4 h-4 text-[#C84B31] shrink-0" />
                <span>
                  {lang === 'ar'
                    ? '١. اضغط على زر المشاركة (Share) في شريط المتصفح.'
                    : '1. Tap the Share button in Safari.'}
                </span>
              </li>
              <li>
                {lang === 'ar'
                  ? '٢. اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
                  : '2. Choose "Add to Home Screen".'}
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full h-10 rounded-xl bg-[#C84B31] text-white text-sm font-semibold cursor-pointer"
            >
              {lang === 'ar' ? 'حسناً' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC<{ lang: Language }> = ({ lang }) => {
  const [offline, setOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-[#C84B31] text-white text-xs font-semibold py-2 px-4 flex items-center justify-center gap-2"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>
        {lang === 'ar'
          ? 'أنت غير متصل بالإنترنت — الألعاب الفردية لا تزال متاحة محلياً'
          : 'You are offline — solo games remain available locally'}
      </span>
    </div>
  );
};
