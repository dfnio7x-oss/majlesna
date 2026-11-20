import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  Lock,
  LogOut,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { Language } from '../types/game';
import { t } from '../i18n/translations';
import { AVATAR_COLORS } from '../data/gamesCatalog';
import { AVATAR_COUNT, AvatarSvg, MajlisnaLogo } from './icons/GameIcons';
import { GamePatternBackground } from './GamePatternBackground';
import { soundEngine } from '../utils/soundEngine';
import { processAlbumImageFile } from '../utils/avatarImage';

interface OnboardingViewProps {
  lang: Language;
  onToggleLang: () => void;
  playerId: string;
  firebaseUser: User | null;
  onLinkGoogle: () => Promise<User>;
  onSignOut: () => Promise<void>;
  onClaimUsername: (params: {
    username: string;
    avatarId: number;
    customAvatarUrl?: string;
    accentColor: string;
    pin?: string;
  }) => Promise<{ ok: boolean; error?: string; reason?: string }>;
  onRegisterWithPassword: (params: {
    username: string;
    password: string;
    avatarId: number;
    customAvatarUrl?: string;
    accentColor: string;
  }) => Promise<{ ok: boolean; error?: string; reason?: string }>;
  onLoginWithPassword: (params: {
    username: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string; reason?: string }>;
}

type CheckState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available' }
  | { status: 'invalid'; reason: string };

type AuthStep = 'entry' | 'login' | 'register';

const GoogleMarkSvg: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
    />
  </svg>
);

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  lang,
  onToggleLang,
  playerId,
  firebaseUser,
  onLinkGoogle,
  onSignOut,
  onClaimUsername,
  onRegisterWithPassword,
  onLoginWithPassword,
}) => {
  const copy = t(lang);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [authStep, setAuthStep] = useState<AuthStep>('entry');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarId, setAvatarId] = useState(0);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | undefined>(undefined);
  const [accentColor, setAccentColor] = useState(AVATAR_COLORS[0]);
  const [pin, setPin] = useState('');
  const [checkState, setCheckState] = useState<CheckState>({ status: 'idle' });
  const [checkingContinue, setCheckingContinue] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  const isGoogleMandatoryUsernameStep = Boolean(firebaseUser);
  const needsUsernameAvailability =
    isGoogleMandatoryUsernameStep || authStep === 'register';

  const trimmedLen = username.trim().length;

  useEffect(() => {
    if (!needsUsernameAvailability) {
      setCheckState({ status: 'idle' });
      return;
    }
    const clean = username.trim();
    if (!clean) {
      setCheckState({ status: 'idle' });
      return;
    }
    if (clean.length < 3) {
      setCheckState({ status: 'invalid', reason: 'too_short' });
      return;
    }
    if (clean.length > 16) {
      setCheckState({ status: 'invalid', reason: 'too_long' });
      return;
    }

    let cancelled = false;
    setCheckState({ status: 'checking' });
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/username/check?username=${encodeURIComponent(clean)}&playerId=${encodeURIComponent(playerId)}`
        );
        if (!res.ok) {
          if (!cancelled) setCheckState({ status: 'invalid', reason: 'rate_limited' });
          return;
        }
        const data = (await res.json()) as { available: boolean; reason?: string };
        if (cancelled) return;
        if (data.available) {
          setCheckState({ status: 'available' });
        } else {
          setCheckState({ status: 'invalid', reason: data.reason || 'taken' });
        }
      } catch {
        if (!cancelled) setCheckState({ status: 'idle' });
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [username, playerId, needsUsernameAvailability]);

  const getReasonMessage = (reason: string): string => {
    switch (reason) {
      case 'too_short':
        return copy.onboarding.tooShort;
      case 'too_long':
        return copy.onboarding.tooLong;
      case 'invalid_chars':
        return copy.onboarding.invalidChars;
      case 'reserved':
        return copy.onboarding.reserved;
      case 'invalid_password':
        return copy.onboarding.passwordTooShort;
      case 'invalid_credentials':
        return copy.onboarding.invalidCredentials;
      case 'taken':
      default:
        return copy.onboarding.taken;
    }
  };

  const handleAlbumFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoBusy(true);
    setSubmitError(null);
    try {
      const compressed = await processAlbumImageFile(file);
      soundEngine.playSelect();
      setCustomAvatarUrl(compressed);
    } catch {
      soundEngine.playError();
      setSubmitError(copy.profile.albumPhotoError);
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleGoogleConnect = async () => {
    soundEngine.playClick();
    setGoogleBusy(true);
    setSubmitError(null);
    try {
      await onLinkGoogle();
    } catch {
      setSubmitError(
        lang === 'ar'
          ? 'تعذر إكمال تسجيل Google. يمكنك المحاولة مجدداً أو المتابعة باسم المستخدم.'
          : 'Google sign-in was cancelled. You can retry or continue with a username.'
      );
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleContinueEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim().replace(/^@+/, '');
    setSubmitError(null);

    if (clean.length < 3) {
      soundEngine.playError();
      setSubmitError(copy.onboarding.tooShort);
      return;
    }
    if (clean.length > 16) {
      soundEngine.playError();
      setSubmitError(copy.onboarding.tooLong);
      return;
    }

    setUsername(clean);
    setCheckingContinue(true);
    soundEngine.playClick();
    try {
      const res = await fetch(
        `/api/username/check?username=${encodeURIComponent(clean)}&playerId=${encodeURIComponent(playerId)}`
      );
      if (!res.ok) {
        setSubmitError(copy.onboarding.taken);
        return;
      }
      const data = (await res.json()) as { available: boolean; reason?: string };
      if (data.available) {
        setCheckState({ status: 'available' });
        setPassword('');
        setConfirmPassword('');
        setAuthStep('register');
      } else if (data.reason === 'taken') {
        setPassword('');
        setAuthStep('login');
      } else {
        soundEngine.playError();
        setSubmitError(getReasonMessage(data.reason || 'invalid_chars'));
      }
    } catch {
      setSubmitError(copy.onboarding.invalidChars);
    } finally {
      setCheckingContinue(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitError(null);

    // Case 1: Google verified user -> mandatory unique username claim
    if (isGoogleMandatoryUsernameStep) {
      if (checkState.status !== 'available') return;
      soundEngine.playSelect();
      setSubmitting(true);
      const res = await onClaimUsername({
        username: username.trim().replace(/^@+/, ''),
        avatarId,
        customAvatarUrl,
        accentColor,
        pin: pin.trim().length >= 4 ? pin.trim() : undefined,
      });
      setSubmitting(false);
      if (!res.ok) {
        soundEngine.playError();
        setSubmitError(getReasonMessage(res.reason || res.error || 'taken'));
      } else {
        soundEngine.playWin();
      }
      return;
    }

    // Case 2: Existing username -> Password Login
    if (authStep === 'login') {
      if (!username.trim() || !password) return;
      soundEngine.playSelect();
      setSubmitting(true);
      const res = await onLoginWithPassword({
        username: username.trim().replace(/^@+/, ''),
        password,
      });
      setSubmitting(false);
      if (!res.ok) {
        soundEngine.playError();
        setSubmitError(getReasonMessage(res.reason || res.error || 'invalid_credentials'));
      } else {
        soundEngine.playWin();
      }
      return;
    }

    // Case 3: New username -> Password + Avatar Registration
    if (checkState.status !== 'available') return;
    if (password.length < 6) {
      soundEngine.playError();
      setSubmitError(copy.onboarding.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      soundEngine.playError();
      setSubmitError(copy.onboarding.passwordMismatch);
      return;
    }

    soundEngine.playSelect();
    setSubmitting(true);
    const res = await onRegisterWithPassword({
      username: username.trim().replace(/^@+/, ''),
      password,
      avatarId,
      customAvatarUrl,
      accentColor,
    });
    setSubmitting(false);
    if (!res.ok) {
      soundEngine.playError();
      setSubmitError(getReasonMessage(res.reason || res.error || 'taken'));
    } else {
      soundEngine.playWin();
    }
  };

  const resetToEntry = () => {
    soundEngine.playClick();
    setAuthStep('entry');
    setPassword('');
    setConfirmPassword('');
    setSubmitError(null);
    setCheckState({ status: 'idle' });
  };

  return (
    <div className="relative min-h-screen bg-[#FAF8F4] dark:bg-[#141210] text-[#1C1917] dark:text-[#F5F2EB] flex flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden">
      <GamePatternBackground />

      {/* Top Language Toggle */}
      <div
        className={`relative z-10 w-full flex justify-end mb-3 transition-all ${
          authStep === 'register' || isGoogleMandatoryUsernameStep ? 'max-w-[540px]' : 'max-w-[430px]'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onToggleLang();
          }}
          className="h-9 px-3 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] bg-white/90 dark:bg-[#1E1B18]/90 backdrop-blur-xs text-xs font-semibold flex items-center gap-1.5 tactile-btn cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-[#57534E] dark:text-[#B8AFA3]" />
          <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </div>

      {/* Main Centered Auth Card (Reference-inspired layout) */}
      <main
        className={`relative z-10 w-full bg-white/95 dark:bg-[#1E1B18]/95 backdrop-blur-md border border-[#E5DEC9] dark:border-[#342E28] rounded-[28px] p-6 sm:p-9 shadow-[0_18px_50px_-24px_rgba(28,25,23,0.18)] space-y-6 transition-all ${
          authStep === 'register' || isGoogleMandatoryUsernameStep ? 'max-w-[540px]' : 'max-w-[430px]'
        }`}
      >
        {/* Centered Uploaded Gamepad/Players Logo + Title */}
        <div className="flex flex-col items-center text-center space-y-3">
          <MajlisnaLogo className="w-20 h-20" />
          <h1 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-[#1C1917] dark:text-[#F5F2EB]">
            {isGoogleMandatoryUsernameStep
              ? copy.onboarding.mandatoryUsernameTitle
              : copy.onboarding.welcomeTitle}
          </h1>
          {isGoogleMandatoryUsernameStep && (
            <p className="text-sm text-[#57534E] dark:text-[#B8AFA3] leading-relaxed">
              {copy.onboarding.mandatoryUsernameSubtitle}
            </p>
          )}
        </div>

        {/* Google Verified User Banner (Mandatory Username Step) */}
        {isGoogleMandatoryUsernameStep && firebaseUser && (
          <div className="p-3.5 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F] dark:text-[#52B788] shrink-0" />
              <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                {firebaseUser.email || firebaseUser.displayName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void onSignOut()}
              className="h-8 px-2.5 rounded-lg border border-[#E5DEC9] dark:border-[#3F3730] bg-white dark:bg-[#1E1B18] text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{copy.onboarding.googleSwitchBtn}</span>
            </button>
          </div>
        )}

        {/* Step 1: Patreon-style Entry Screen (Username Input -> Continue -> OR -> Google) */}
        {!isGoogleMandatoryUsernameStep && authStep === 'entry' && (
          <div className="space-y-4">
            <form onSubmit={handleContinueEntry} className="space-y-3">
              <div className="relative">
                <input
                  id="onboarding-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSubmitError(null);
                  }}
                  maxLength={16}
                  placeholder={copy.onboarding.usernamePlaceholder}
                  aria-label={copy.onboarding.usernamePlaceholder}
                  autoComplete="username"
                  className="w-full h-13 ps-4 pe-11 rounded-2xl bg-[#ECE8DF] dark:bg-[#28231E] border border-transparent focus:border-[#1C1917]/40 dark:focus:border-[#F5F2EB]/40 text-sm sm:text-base font-medium text-[#1C1917] dark:text-[#F5F2EB] placeholder:text-[#78716C] dark:placeholder:text-[#9D9386] focus:outline-none transition-colors"
                />
                {username.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('');
                      setSubmitError(null);
                    }}
                    aria-label={lang === 'ar' ? 'مسح' : 'Clear'}
                    className="w-6 h-6 rounded-full bg-[#A8A29E]/55 hover:bg-[#A8A29E]/80 text-white flex items-center justify-center absolute top-1/2 -translate-y-1/2 end-3.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {submitError && (
                <p className="text-xs font-semibold text-[#C84B31] dark:text-[#F87171] px-1">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={checkingContinue || !username.trim()}
                className="w-full h-12 rounded-2xl bg-[#1C1917] hover:bg-[#2E2926] dark:bg-[#F5F2EB] dark:hover:bg-[#E5DEC9] disabled:opacity-50 text-white dark:text-[#1C1917] text-sm sm:text-base font-bold tactile-btn cursor-pointer flex items-center justify-center gap-2"
              >
                {checkingContinue && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{copy.onboarding.continueBtn}</span>
              </button>
            </form>

            {/* "أو / or" Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-[#E5DEC9] dark:bg-[#342E28]" />
              <span className="text-xs font-semibold text-[#78716C] dark:text-[#9D9386]">
                {copy.onboarding.orDivider}
              </span>
              <div className="h-px flex-1 bg-[#E5DEC9] dark:bg-[#342E28]" />
            </div>

            {/* Continue with Google (NO Apple sign-in) */}
            <button
              type="button"
              onClick={handleGoogleConnect}
              disabled={googleBusy}
              className="w-full h-12 rounded-2xl border border-[#DCD5C3] dark:border-[#3A332C] bg-white dark:bg-[#25211D] hover:bg-[#FAF8F4] dark:hover:bg-[#2E2924] text-sm sm:text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB] tactile-btn cursor-pointer disabled:opacity-60 flex items-center justify-center gap-3"
            >
              <GoogleMarkSvg />
              <span>{googleBusy ? '...' : copy.onboarding.googleContinueBtn}</span>
            </button>
          </div>
        )}

        {/* Step 2 / Mandatory Username Form */}
        {(isGoogleMandatoryUsernameStep || authStep === 'login' || authStep === 'register') && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Chosen / Locked Username Row */}
            {!isGoogleMandatoryUsernameStep ? (
              <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-[#ECE8DF] dark:bg-[#28231E]">
                <div className="min-w-0">
                  <p dir="ltr" className="text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                    @{username}
                  </p>
                  <p className="text-[11px] text-[#57534E] dark:text-[#B8AFA3]">
                    {authStep === 'login'
                      ? copy.onboarding.existingAccountNotice
                      : copy.onboarding.available}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetToEntry}
                  className="text-xs font-bold text-[#C84B31] hover:underline shrink-0 cursor-pointer"
                >
                  {copy.onboarding.changeUsernameBtn}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="onboarding-username" className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
                    {copy.onboarding.usernamePrompt}
                  </label>
                  <span
                    className={`font-mono-tabular text-xs font-semibold ${
                      trimmedLen >= 3 && trimmedLen <= 16
                        ? 'text-[#2D6A4F] dark:text-[#52B788]'
                        : 'text-[#8C8478] dark:text-[#9D9386]'
                    }`}
                  >
                    {trimmedLen}/16
                  </span>
                </div>

                <input
                  id="onboarding-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSubmitError(null);
                  }}
                  maxLength={16}
                  placeholder={copy.onboarding.usernamePlaceholder}
                  autoComplete="username"
                  className="w-full h-12 px-4 rounded-2xl bg-[#ECE8DF] dark:bg-[#28231E] border border-transparent focus:border-[#C84B31] text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB] placeholder:text-[#78716C] focus:outline-none"
                />

                <div className="min-h-[20px] flex items-center gap-2 text-xs">
                  {checkState.status === 'checking' && (
                    <span className="flex items-center gap-1.5 text-[#57534E] dark:text-[#B8AFA3]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {copy.onboarding.checking}
                    </span>
                  )}
                  {checkState.status === 'available' && (
                    <span className="flex items-center gap-1.5 text-[#2D6A4F] dark:text-[#52B788] font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      {copy.onboarding.available}
                    </span>
                  )}
                  {checkState.status === 'invalid' && (
                    <span className="flex items-center gap-1.5 text-[#C84B31] dark:text-[#F87171] font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      {getReasonMessage(checkState.reason)}
                    </span>
                  )}
                  {checkState.status === 'idle' && (
                    <span className="text-[#8C8478] dark:text-[#9D9386]">{copy.onboarding.rulesHint}</span>
                  )}
                </div>
              </div>
            )}

            {/* Password Fields (Login or Register) */}
            {!isGoogleMandatoryUsernameStep && (
              <div className={authStep === 'register' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5' : 'space-y-2'}>
                <div className="space-y-1.5">
                  <label htmlFor="onboarding-password" className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
                    {copy.onboarding.passwordLabel}
                  </label>
                  <input
                    id="onboarding-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setSubmitError(null);
                    }}
                    maxLength={72}
                    placeholder={copy.onboarding.passwordPlaceholder}
                    autoComplete={authStep === 'login' ? 'current-password' : 'new-password'}
                    autoFocus
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
                  />
                </div>
                {authStep === 'register' && (
                  <div className="space-y-1.5">
                    <label htmlFor="onboarding-confirm-password" className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
                      {copy.onboarding.confirmPasswordLabel}
                    </label>
                    <input
                      id="onboarding-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setSubmitError(null);
                      }}
                      maxLength={72}
                      placeholder={copy.onboarding.passwordPlaceholder}
                      autoComplete="new-password"
                      className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Avatar + Album Upload + Accent Color (Register & Google Mandatory Username Steps) */}
            {needsUsernameAvailability && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-5 flex flex-col gap-3 p-3.5 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
                    <div className="flex items-center gap-3">
                      <AvatarSvg
                        avatarId={avatarId}
                        customAvatarUrl={customAvatarUrl}
                        accentColor={accentColor}
                        size={52}
                      />
                      <div className="min-w-0">
                        <p className="font-display text-sm font-bold truncate">
                          {username.trim() || copy.brand}
                        </p>
                        <p dir="ltr" className="text-xs text-[#57534E] dark:text-[#B8AFA3] truncate">
                          @{username.trim().toLowerCase() || 'player'}
                        </p>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAlbumFileChange}
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        disabled={photoBusy}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 h-8 px-2.5 rounded-lg border border-[#E5DEC9] dark:border-[#3F3730] bg-white dark:bg-[#1E1B18] hover:bg-[#F1ECE2] dark:hover:bg-[#2A2520] text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#C84B31]" />
                        <span>{photoBusy ? '...' : copy.profile.uploadAlbumPhoto}</span>
                      </button>
                      {customAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setCustomAvatarUrl(undefined)}
                          title={copy.profile.removeAlbumPhoto}
                          aria-label={copy.profile.removeAlbumPhoto}
                          className="h-8 w-8 rounded-lg border border-[#E5DEC9] dark:border-[#3F3730] bg-white dark:bg-[#1E1B18] text-[#C84B31] flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-7 space-y-2.5">
                    <div className="grid grid-cols-6 gap-2">
                      {Array.from({ length: AVATAR_COUNT }).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            soundEngine.playClick();
                            setCustomAvatarUrl(undefined);
                            setAvatarId(idx);
                          }}
                          aria-label={`Avatar ${idx + 1}`}
                          className={`p-1 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                            !customAvatarUrl && avatarId === idx
                              ? 'border-[#C84B31] ring-2 ring-[#C84B31]/25 bg-[#FAF8F4] dark:bg-[#2C2722]'
                              : 'border-[#E5DEC9] dark:border-[#342E28]'
                          }`}
                        >
                          <AvatarSvg avatarId={idx} accentColor={accentColor} size={30} />
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            soundEngine.playClick();
                            setAccentColor(color);
                          }}
                          aria-label={`Color ${color}`}
                          className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                            accentColor === color ? 'scale-115 ring-2 ring-offset-2 ring-[#1C1917] dark:ring-[#F5F2EB]' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {isGoogleMandatoryUsernameStep && (
                  <div className="space-y-1.5">
                    <label htmlFor="onboarding-pin" className="flex items-center gap-1.5 text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
                      <Lock className="w-3.5 h-3.5" />
                      {copy.profile.pinLabel}
                    </label>
                    <input
                      id="onboarding-pin"
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      maxLength={16}
                      placeholder={copy.profile.pinPlaceholder}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
                    />
                  </div>
                )}

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#D97706]/10 border border-[#D97706]/25 text-xs text-[#92400E] dark:text-[#FBBF24]">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{copy.onboarding.cooldownNotice}</span>
                </div>
              </div>
            )}

            {submitError && (
              <p className="text-xs font-semibold text-[#C84B31] dark:text-[#F87171]">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={
                submitting ||
                (needsUsernameAvailability
                  ? checkState.status !== 'available'
                  : !username.trim() || !password)
              }
              className="w-full h-12 rounded-2xl bg-[#1C1917] hover:bg-[#2E2926] dark:bg-[#F5F2EB] dark:hover:bg-[#E5DEC9] disabled:opacity-50 text-white dark:text-[#1C1917] text-sm font-bold tactile-btn cursor-pointer"
            >
              {submitting
                ? '...'
                : isGoogleMandatoryUsernameStep
                ? copy.onboarding.submitBtn
                : authStep === 'login'
                ? copy.onboarding.loginBtn
                : copy.onboarding.registerBtn}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};
