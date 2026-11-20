import type { GameId, MatchOutcome, PlayerProfile, UserPreferences } from '../types/game';

const VALID_UID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

function clampInt(value: unknown, min: number, max: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, Math.trunc(num)));
}

function clampUnit(value: unknown, fallback = 0.5): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(1, Number(num.toFixed(4))));
}

function clipChars(value: string, maxChars: number): string {
  return Array.from(value).slice(0, maxChars).join('');
}

export function isValidFirebaseUid(uid: unknown): uid is string {
  return typeof uid === 'string' && VALID_UID_REGEX.test(uid);
}

export interface PublicProfileStatsPatch {
  avatarId: number;
  customAvatarUrl: string;
  accentColor: string;
  wins: number;
  losses: number;
  draws: number;
  totalPoints: number;
  gamesPlayedCount: number;
  unlockedAchievements: string[];
}

export interface PublicProfileCreateData extends PublicProfileStatsPatch {
  uid: string;
  username: string;
  usernameLower: string;
  usernameUpdatedAt?: string;
  nextUsernameChangeAt?: string;
}

export interface UsernameUpdateData {
  username: string;
  usernameLower: string;
  usernameUpdatedAt?: string;
  nextUsernameChangeAt?: string;
}

export function buildPublicProfileStatsPatch(profile: PlayerProfile): PublicProfileStatsPatch {
  const rawAccent = typeof profile.accentColor === 'string' ? profile.accentColor.trim() : '';
  const accentColor =
    rawAccent.length >= 4 && rawAccent.length <= 16 ? rawAccent : '#C84B31';

  const rawAvatar = typeof profile.customAvatarUrl === 'string' ? profile.customAvatarUrl.trim() : '';
  const customAvatarUrl =
    rawAvatar.length <= 65000 && /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(rawAvatar)
      ? rawAvatar
      : '';

  const gamesPlayedCount = clampInt(
    Object.values(profile.gamesPlayed ?? {}).reduce<number>(
      (sum, count) => sum + Math.max(0, Math.trunc(Number(count) || 0)),
      0
    ),
    0,
    1_000_000
  );

  const unlockedAchievements = Array.isArray(profile.unlockedAchievements)
    ? profile.unlockedAchievements
        .filter((item): item is string => typeof item === 'string' && item.trim().length >= 1)
        .map((item) => clipChars(item.trim(), 64))
        .slice(0, 50)
    : [];

  return {
    avatarId: clampInt(profile.avatarId, 0, 24),
    customAvatarUrl,
    accentColor,
    wins: clampInt(profile.wins, 0, 1_000_000),
    losses: clampInt(profile.losses, 0, 1_000_000),
    draws: clampInt(profile.draws, 0, 1_000_000),
    totalPoints: clampInt(profile.totalPoints, 0, 100_000_000),
    gamesPlayedCount,
    unlockedAchievements,
  };
}

export function buildUsernameFields(profile: PlayerProfile): UsernameUpdateData | null {
  const rawName = typeof profile.username === 'string' ? profile.username.trim().normalize('NFKC') : '';
  const rawLower =
    typeof profile.usernameLower === 'string'
      ? profile.usernameLower.trim().normalize('NFKC').toLowerCase()
      : rawName.toLowerCase();

  const username = clipChars(rawName, 16);
  const usernameLower = clipChars(rawLower, 16);

  if (Array.from(username).length < 3 || Array.from(usernameLower).length < 3) {
    return null;
  }

  const out: UsernameUpdateData = {
    username,
    usernameLower,
  };

  if (
    typeof profile.usernameUpdatedAt === 'string' &&
    profile.usernameUpdatedAt.length >= 10 &&
    profile.usernameUpdatedAt.length <= 40
  ) {
    out.usernameUpdatedAt = profile.usernameUpdatedAt;
  }

  if (
    typeof profile.nextUsernameChangeAt === 'string' &&
    profile.nextUsernameChangeAt.length >= 10 &&
    profile.nextUsernameChangeAt.length <= 40
  ) {
    out.nextUsernameChangeAt = profile.nextUsernameChangeAt;
  }

  return out;
}

export function buildPublicProfileCreateData(
  profile: PlayerProfile,
  uid: string
): PublicProfileCreateData | null {
  if (!isValidFirebaseUid(uid)) return null;
  const usernameFields = buildUsernameFields(profile);
  if (!usernameFields) return null;

  return {
    uid,
    ...usernameFields,
    ...buildPublicProfileStatsPatch(profile),
  };
}

export interface PrivateAccountPayload {
  uid: string;
  email?: string;
  lang: 'ar' | 'en';
  theme: 'light' | 'dark' | 'system';
  audioMuted: boolean;
  sfxVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
}

export function buildPrivateAccountPayload(
  prefs: UserPreferences,
  uid: string,
  email?: string | null
): PrivateAccountPayload | null {
  if (!isValidFirebaseUid(uid)) return null;

  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  const safeEmail =
    trimmedEmail.length >= 3 && trimmedEmail.length <= 200 ? trimmedEmail : undefined;

  return {
    uid,
    ...(safeEmail ? { email: safeEmail } : {}),
    lang: prefs.lang === 'en' ? 'en' : 'ar',
    theme:
      prefs.theme === 'light' || prefs.theme === 'dark' || prefs.theme === 'system'
        ? prefs.theme
        : 'system',
    audioMuted: Boolean(prefs.audio?.muted),
    sfxVolume: clampUnit(prefs.audio?.sfxVolume, 0.55),
    musicEnabled: Boolean(prefs.audio?.musicEnabled),
    musicVolume: clampUnit(prefs.audio?.musicVolume, 0.22),
  };
}

export interface MatchHistoryWritePayload {
  uid: string;
  gameId: string;
  mode: 'solo' | 'local' | 'online';
  outcome: MatchOutcome;
  pointsEarned: number;
  opponentLabel?: string;
  playedAt: string;
}

export function buildMatchHistoryPayload(params: {
  uid: string;
  gameId: GameId;
  mode: 'solo' | 'local' | 'online';
  outcome: MatchOutcome;
  pointsEarned: number;
  opponentLabel?: string;
  playedAt: string;
}): MatchHistoryWritePayload | null {
  if (!isValidFirebaseUid(params.uid)) return null;
  const gameId = clipChars(String(params.gameId || '').trim(), 48);
  if (gameId.length < 2) return null;

  const playedAt =
    typeof params.playedAt === 'string' &&
    params.playedAt.length >= 10 &&
    params.playedAt.length <= 40
      ? params.playedAt
      : new Date().toISOString();

  const cleanOpponent =
    typeof params.opponentLabel === 'string' ? clipChars(params.opponentLabel.trim(), 40) : '';

  return {
    uid: params.uid,
    gameId,
    mode: params.mode,
    outcome: params.outcome,
    pointsEarned: clampInt(params.pointsEarned, 0, 100_000),
    ...(cleanOpponent.length >= 1 ? { opponentLabel: cleanOpponent } : {}),
    playedAt,
  };
}
