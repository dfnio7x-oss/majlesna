import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { PlayerProfile, PublicPlayerSummary } from '../src/types/game.ts';
import {
  computeUsernameBlindIndex,
  encryptSensitive,
  hashSecretArgon2id,
  issueSessionToken,
  normalizeUsername,
  sanitizeCustomAvatarUrl,
  validateUsernameFormat,
  verifySecretArgon2id,
} from './securityCrypto.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');

export const USERNAME_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface UsernameIndexEntry {
  ownerId: string;
  updatedAt: string;
}

interface RetiredUsernameEntry {
  ownerId: string;
  retiredAt: string;
}

interface StoredRecord {
  profile: PlayerProfile;
  encryptedEmail?: string;
  pinHashArgon2id?: string;
  passwordHashArgon2id?: string;
  cooldownAudit?: Array<{ at: string; blindIndex: string }>;
}

interface StoreFileShape {
  records: Record<string, StoredRecord>;
  usernameIndex: Record<string, UsernameIndexEntry>;
  retiredUsernameIndex: Record<string, RetiredUsernameEntry>;
}

export type UsernameCheckMode = 'entry' | 'register' | 'claim' | 'rename';

let cache: StoreFileShape | null = null;

function rebuildUsernameIndexes(store: StoreFileShape): boolean {
  let changed = false;

  for (const [recordId, rec] of Object.entries(store.records)) {
    const p = rec?.profile;
    if (!p) continue;

    let currentBlindIndex: string | null = null;
    const rawUsername = p.usernameLower || p.username;
    if (p.onboardingCompleted && typeof rawUsername === 'string' && rawUsername.trim().length >= 3) {
      const normalized = normalizeUsername(rawUsername);
      currentBlindIndex = computeUsernameBlindIndex(normalized);
      if (p.usernameLower !== normalized) {
        p.usernameLower = normalized;
        changed = true;
      }
      if (!store.usernameIndex[currentBlindIndex]) {
        store.usernameIndex[currentBlindIndex] = {
          ownerId: recordId,
          updatedAt: p.usernameUpdatedAt || p.createdAt || new Date().toISOString(),
        };
        changed = true;
      }
    }

    if (Array.isArray(rec.cooldownAudit)) {
      for (const audit of rec.cooldownAudit) {
        if (!audit?.blindIndex) continue;
        if (audit.blindIndex !== currentBlindIndex && !store.retiredUsernameIndex[audit.blindIndex]) {
          store.retiredUsernameIndex[audit.blindIndex] = {
            ownerId: recordId,
            retiredAt: audit.at || new Date().toISOString(),
          };
          changed = true;
        }
      }
    }
  }

  return changed;
}

function ensureStore(): StoreFileShape {
  if (cache) return cache;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(PROFILES_FILE)) {
      const raw = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8')) as Partial<StoreFileShape> &
        Record<string, unknown>;
      if (raw && typeof raw === 'object' && 'records' in raw && 'usernameIndex' in raw) {
        cache = {
          records: (raw.records as Record<string, StoredRecord>) ?? {},
          usernameIndex: (raw.usernameIndex as Record<string, UsernameIndexEntry>) ?? {},
          retiredUsernameIndex: (raw.retiredUsernameIndex as Record<string, RetiredUsernameEntry>) ?? {},
        };
        if (rebuildUsernameIndexes(cache)) {
          persistStore();
        }
        return cache;
      }
      // Migrate legacy Phase 1 flat profile map seamlessly
      const migratedRecords: Record<string, StoredRecord> = {};
      for (const [k, v] of Object.entries(raw ?? {})) {
        if (v && typeof v === 'object' && 'id' in v) {
          const legacy = v as PlayerProfile;
          migratedRecords[k] = {
            profile: {
              ...legacy,
              createdAt: legacy.createdAt ?? new Date().toISOString(),
              onboardingCompleted: legacy.onboardingCompleted ?? Boolean(legacy.username),
            },
          };
        }
      }
      cache = { records: migratedRecords, usernameIndex: {}, retiredUsernameIndex: {} };
      rebuildUsernameIndexes(cache);
      persistStore();
      return cache;
    }
  } catch {
    // fallback to clean store
  }
  cache = { records: {}, usernameIndex: {}, retiredUsernameIndex: {} };
  return cache;
}

export function resetProfileStoreCacheForTests(): void {
  cache = null;
}

function persistStore(): void {
  if (!cache) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch {
    // ignore read-only disk errors
  }
}

function toPublicSafeProfile(rec: StoredRecord): PlayerProfile {
  return {
    ...rec.profile,
    hasPin: Boolean(rec.pinHashArgon2id),
  };
}

export function getStoredProfile(id: string): PlayerProfile | null {
  const store = ensureStore();
  const rec = store.records[id];
  return rec ? toPublicSafeProfile(rec) : null;
}

export function saveStoredProfile(incoming: PlayerProfile): PlayerProfile {
  const store = ensureStore();
  const existingRec = store.records[incoming.id];
  const hasCustomAvatarField = 'customAvatarUrl' in incoming;
  const cleanedAvatar = hasCustomAvatarField
    ? sanitizeCustomAvatarUrl(incoming.customAvatarUrl)
    : existingRec?.profile.customAvatarUrl;

  // Never allow client POST /api/profile to bypass authoritative username cooldown or overwrite username without /claim or /change
  const safeProfile: PlayerProfile = existingRec
    ? {
        ...incoming,
        username: existingRec.profile.username ?? incoming.username,
        usernameLower: existingRec.profile.usernameLower ?? incoming.usernameLower,
        customAvatarUrl: cleanedAvatar,
        authMethod: existingRec.profile.authMethod ?? incoming.authMethod,
        createdAt: existingRec.profile.createdAt ?? incoming.createdAt ?? new Date().toISOString(),
        usernameUpdatedAt: existingRec.profile.usernameUpdatedAt ?? incoming.usernameUpdatedAt ?? null,
        nextUsernameChangeAt: existingRec.profile.nextUsernameChangeAt ?? incoming.nextUsernameChangeAt ?? null,
        onboardingCompleted: existingRec.profile.onboardingCompleted ?? incoming.onboardingCompleted ?? false,
        hasPin: Boolean(existingRec.pinHashArgon2id),
      }
    : {
        ...incoming,
        customAvatarUrl: sanitizeCustomAvatarUrl(incoming.customAvatarUrl),
        createdAt: incoming.createdAt || new Date().toISOString(),
        onboardingCompleted: incoming.onboardingCompleted ?? false,
        hasPin: false,
      };

  // Ensure any valid onboarded username synced from cloud is registered in usernameIndex
  const rawU = safeProfile.usernameLower || safeProfile.username;
  if (safeProfile.onboardingCompleted && typeof rawU === 'string' && rawU.trim().length >= 3) {
    const normalized = normalizeUsername(rawU);
    safeProfile.usernameLower = normalized;
    const blindIndex = computeUsernameBlindIndex(normalized);
    if (!store.usernameIndex[blindIndex] && !store.retiredUsernameIndex[blindIndex]) {
      store.usernameIndex[blindIndex] = {
        ownerId: incoming.id,
        updatedAt: safeProfile.usernameUpdatedAt || new Date().toISOString(),
      };
    }
  }

  store.records[incoming.id] = {
    ...(existingRec ?? {}),
    profile: safeProfile,
  };
  persistStore();
  return toPublicSafeProfile(store.records[incoming.id]);
}

export function checkUsernameAvailability(
  rawUsername: string,
  requesterId?: string,
  mode: UsernameCheckMode = 'register'
): {
  available: boolean;
  normalized: string;
  reason?: 'too_short' | 'too_long' | 'invalid_chars' | 'reserved' | 'taken' | 'retired';
} {
  const validation = validateUsernameFormat(rawUsername);
  if (!validation.valid) {
    return {
      available: false,
      normalized: validation.normalized,
      reason: validation.reason,
    };
  }
  const store = ensureStore();
  const blindIndex = computeUsernameBlindIndex(validation.normalized);

  // Permanently block any retired/previously used username regardless of who tries to claim it
  if (store.retiredUsernameIndex[blindIndex]) {
    return {
      available: false,
      normalized: validation.normalized,
      reason: 'retired',
    };
  }

  const hit = store.usernameIndex[blindIndex];
  if (hit) {
    // Allow requester only when claiming an un-onboarded account with a pre-reserved index
    const isUnfinishedClaimOwner =
      mode === 'claim' &&
      Boolean(requesterId) &&
      hit.ownerId === requesterId &&
      !store.records[requesterId!]?.profile.onboardingCompleted;

    if (!isUnfinishedClaimOwner) {
      return {
        available: false,
        normalized: validation.normalized,
        reason: 'taken',
      };
    }
  }
  return {
    available: true,
    normalized: validation.normalized,
  };
}

export async function claimInitialUsername(params: {
  playerId: string;
  uid?: string;
  email?: string;
  rawUsername: string;
  avatarId?: number;
  customAvatarUrl?: string;
  accentColor?: string;
  pin?: string;
}): Promise<{
  ok: boolean;
  status: number;
  error?: string;
  reason?: string;
  profile?: PlayerProfile;
}> {
  const trimmedDisplay = params.rawUsername.trim().normalize('NFKC');
  const availability = checkUsernameAvailability(trimmedDisplay, params.playerId, 'claim');
  if (!availability.available) {
    return {
      ok: false,
      status: availability.reason === 'taken' || availability.reason === 'retired' ? 409 : 400,
      error: availability.reason ?? 'invalid_username',
      reason: availability.reason,
    };
  }

  const store = ensureStore();
  const existingRec = store.records[params.playerId];
  if (existingRec?.profile.username && existingRec.profile.onboardingCompleted) {
    return {
      ok: false,
      status: 409,
      error: 'already_registered',
      reason: 'already_registered',
      profile: toPublicSafeProfile(existingRec),
    };
  }

  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const nextIso = new Date(now + USERNAME_COOLDOWN_MS).toISOString();
  const blindIndex = computeUsernameBlindIndex(availability.normalized);

  if (store.retiredUsernameIndex[blindIndex]) {
    return { ok: false, status: 409, error: 'retired', reason: 'retired' };
  }

  // Double-check uniqueness atomically
  const ownerEntry = store.usernameIndex[blindIndex];
  if (ownerEntry && ownerEntry.ownerId !== params.playerId) {
    return { ok: false, status: 409, error: 'taken', reason: 'taken' };
  }

  const cleanedAvatar = sanitizeCustomAvatarUrl(params.customAvatarUrl);

  const baseProfile: PlayerProfile = existingRec?.profile ?? {
    id: params.playerId,
    uid: params.uid,
    name: trimmedDisplay,
    avatarId: params.avatarId ?? 0,
    accentColor: params.accentColor ?? '#C84B31',
    createdAt: nowIso,
    onboardingCompleted: true,
    wins: 0,
    losses: 0,
    draws: 0,
    totalPoints: 0,
    gamesPlayed: {},
    unlockedAchievements: [],
    matchHistory: [],
  };

  const updatedProfile: PlayerProfile = {
    ...baseProfile,
    uid: params.uid ?? baseProfile.uid,
    name: trimmedDisplay,
    username: trimmedDisplay,
    usernameLower: availability.normalized,
    avatarId: params.avatarId ?? baseProfile.avatarId,
    customAvatarUrl: cleanedAvatar ?? baseProfile.customAvatarUrl,
    accentColor: params.accentColor ?? baseProfile.accentColor,
    authMethod: params.uid ? 'google' : baseProfile.authMethod ?? 'local',
    createdAt: baseProfile.createdAt || nowIso,
    usernameUpdatedAt: nowIso,
    nextUsernameChangeAt: nextIso,
    onboardingCompleted: true,
    isFirebaseLinked: Boolean(params.uid),
  };

  let pinHashArgon2id = existingRec?.pinHashArgon2id;
  if (params.pin && params.pin.trim().length >= 4) {
    pinHashArgon2id = await hashSecretArgon2id(params.pin.trim());
  }

  const encryptedEmail = params.email ? encryptSensitive(params.email) : existingRec?.encryptedEmail;

  store.usernameIndex[blindIndex] = {
    ownerId: params.playerId,
    updatedAt: nowIso,
  };
  store.records[params.playerId] = {
    ...(existingRec ?? {}),
    profile: updatedProfile,
    encryptedEmail,
    pinHashArgon2id,
    cooldownAudit: [...(existingRec?.cooldownAudit ?? []), { at: nowIso, blindIndex }],
  };

  persistStore();
  return {
    ok: true,
    status: 200,
    profile: toPublicSafeProfile(store.records[params.playerId]),
  };
}

export async function changeRegisteredUsername(params: {
  playerId: string;
  rawUsername: string;
  pin?: string;
}): Promise<{
  ok: boolean;
  status: number;
  error?: string;
  reason?: string;
  nextEligibleAt?: string;
  profile?: PlayerProfile;
}> {
  const store = ensureStore();
  const rec = store.records[params.playerId];
  if (!rec || !rec.profile.username) {
    return { ok: false, status: 404, error: 'profile_not_found', reason: 'profile_not_found' };
  }

  // Verify Argon2id PIN if the user configured one
  if (rec.pinHashArgon2id) {
    if (!params.pin || !(await verifySecretArgon2id(rec.pinHashArgon2id, params.pin))) {
      return { ok: false, status: 403, error: 'invalid_pin', reason: 'invalid_pin' };
    }
  }

  // Server-authoritative 7-day cooldown check
  const nextAllowedMs = rec.profile.nextUsernameChangeAt
    ? Date.parse(rec.profile.nextUsernameChangeAt)
    : 0;
  const now = Date.now();
  if (nextAllowedMs > now) {
    return {
      ok: false,
      status: 429,
      error: 'cooldown_active',
      reason: 'cooldown_active',
      nextEligibleAt: rec.profile.nextUsernameChangeAt ?? new Date(nextAllowedMs).toISOString(),
    };
  }

  const trimmedDisplay = params.rawUsername.trim().normalize('NFKC');
  const availability = checkUsernameAvailability(trimmedDisplay, params.playerId, 'rename');
  if (!availability.available) {
    return {
      ok: false,
      status: availability.reason === 'taken' || availability.reason === 'retired' ? 409 : 400,
      error: availability.reason ?? 'invalid_username',
      reason: availability.reason,
    };
  }

  const nowIso = new Date(now).toISOString();

  // Permanently retire previous username blind index so nobody (including same user) can reuse it later
  if (rec.profile.usernameLower || rec.profile.username) {
    const oldNorm = normalizeUsername(rec.profile.usernameLower || rec.profile.username || '');
    const oldIndex = computeUsernameBlindIndex(oldNorm);
    if (store.usernameIndex[oldIndex]?.ownerId === params.playerId) {
      delete store.usernameIndex[oldIndex];
    }
    store.retiredUsernameIndex[oldIndex] = {
      ownerId: params.playerId,
      retiredAt: nowIso,
    };
  }

  const nextIso = new Date(now + USERNAME_COOLDOWN_MS).toISOString();
  const newIndex = computeUsernameBlindIndex(availability.normalized);

  store.usernameIndex[newIndex] = {
    ownerId: params.playerId,
    updatedAt: nowIso,
  };
  rec.profile = {
    ...rec.profile,
    name: trimmedDisplay,
    username: trimmedDisplay,
    usernameLower: availability.normalized,
    usernameUpdatedAt: nowIso,
    nextUsernameChangeAt: nextIso,
  };
  rec.cooldownAudit = [...(rec.cooldownAudit ?? []), { at: nowIso, blindIndex: newIndex }];

  persistStore();
  return {
    ok: true,
    status: 200,
    profile: toPublicSafeProfile(rec),
  };
}

export async function setAccountSecurityPin(playerId: string, pin: string): Promise<{ ok: boolean; status: number }> {
  const store = ensureStore();
  const rec = store.records[playerId];
  if (!rec) return { ok: false, status: 404 };
  if (pin.trim().length < 4 || pin.trim().length > 32) {
    return { ok: false, status: 400 };
  }
  rec.pinHashArgon2id = await hashSecretArgon2id(pin.trim());
  rec.profile.hasPin = true;
  persistStore();
  return { ok: true, status: 200 };
}

export async function registerWithUsernamePassword(params: {
  rawUsername: string;
  password: string;
  avatarId?: number;
  customAvatarUrl?: string;
  accentColor?: string;
}): Promise<{
  ok: boolean;
  status: number;
  error?: string;
  reason?: string;
  profile?: PlayerProfile;
  sessionToken?: string;
}> {
  const trimmedDisplay = params.rawUsername.trim().normalize('NFKC');
  const availability = checkUsernameAvailability(trimmedDisplay, undefined, 'register');
  if (!availability.available) {
    return {
      ok: false,
      status: availability.reason === 'taken' || availability.reason === 'retired' ? 409 : 400,
      error: availability.reason ?? 'invalid_username',
      reason: availability.reason,
    };
  }

  const cleanPass = params.password ?? '';
  if (cleanPass.length < 6 || cleanPass.length > 72) {
    return {
      ok: false,
      status: 400,
      error: 'invalid_password',
      reason: 'invalid_password',
    };
  }

  const store = ensureStore();
  const blindIndex = computeUsernameBlindIndex(availability.normalized);
  if (store.retiredUsernameIndex[blindIndex]) {
    return { ok: false, status: 409, error: 'retired', reason: 'retired' };
  }
  if (store.usernameIndex[blindIndex]) {
    return { ok: false, status: 409, error: 'taken', reason: 'taken' };
  }

  const playerId = `u_${crypto.randomBytes(8).toString('hex')}`;
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const nextIso = new Date(now + USERNAME_COOLDOWN_MS).toISOString();
  const passwordHashArgon2id = await hashSecretArgon2id(cleanPass);

  const profile: PlayerProfile = {
    id: playerId,
    name: trimmedDisplay,
    username: trimmedDisplay,
    usernameLower: availability.normalized,
    avatarId: params.avatarId ?? 0,
    customAvatarUrl: sanitizeCustomAvatarUrl(params.customAvatarUrl),
    accentColor: params.accentColor ?? '#C84B31',
    authMethod: 'password',
    createdAt: nowIso,
    usernameUpdatedAt: nowIso,
    nextUsernameChangeAt: nextIso,
    onboardingCompleted: true,
    isFirebaseLinked: false,
    hasPin: false,
    wins: 0,
    losses: 0,
    draws: 0,
    totalPoints: 0,
    gamesPlayed: {},
    unlockedAchievements: [],
    matchHistory: [],
  };

  store.usernameIndex[blindIndex] = { ownerId: playerId, updatedAt: nowIso };
  store.records[playerId] = {
    profile,
    passwordHashArgon2id,
    cooldownAudit: [{ at: nowIso, blindIndex }],
  };
  persistStore();

  return {
    ok: true,
    status: 201,
    profile: toPublicSafeProfile(store.records[playerId]),
    sessionToken: issueSessionToken(playerId),
  };
}

export async function loginWithUsernamePassword(params: {
  rawUsername: string;
  password: string;
}): Promise<{
  ok: boolean;
  status: number;
  error?: string;
  reason?: string;
  profile?: PlayerProfile;
  sessionToken?: string;
}> {
  const cleanUser = params.rawUsername.replace(/^@+/, '').trim().normalize('NFKC');
  const normalized = normalizeUsername(cleanUser);
  if (normalized.length < 3 || !params.password) {
    return { ok: false, status: 400, error: 'invalid_credentials', reason: 'invalid_credentials' };
  }

  const store = ensureStore();
  const blindIndex = computeUsernameBlindIndex(normalized);
  const idxEntry = store.usernameIndex[blindIndex];
  if (!idxEntry) {
    return { ok: false, status: 401, error: 'invalid_credentials', reason: 'invalid_credentials' };
  }

  const rec = store.records[idxEntry.ownerId];
  if (!rec || !rec.passwordHashArgon2id) {
    return { ok: false, status: 401, error: 'invalid_credentials', reason: 'invalid_credentials' };
  }

  const valid = await verifySecretArgon2id(rec.passwordHashArgon2id, params.password);
  if (!valid) {
    return { ok: false, status: 401, error: 'invalid_credentials', reason: 'invalid_credentials' };
  }

  return {
    ok: true,
    status: 200,
    profile: toPublicSafeProfile(rec),
    sessionToken: issueSessionToken(rec.profile.id),
  };
}

export function findPlayerIdByUsername(rawUsername: string): string | null {
  const clean = rawUsername.replace(/^@+/, '').trim().normalize('NFKC');
  if (!clean) return null;
  const store = ensureStore();
  const blindIndex = computeUsernameBlindIndex(normalizeUsername(clean));
  return store.usernameIndex[blindIndex]?.ownerId ?? null;
}

export function getPublicSummaryById(
  playerId: string,
  online = false,
  activeRoomCode: string | null = null
): PublicPlayerSummary | null {
  const store = ensureStore();
  const rec = store.records[playerId];
  if (!rec || !rec.profile.username) return null;
  return {
    id: rec.profile.id,
    username: rec.profile.username,
    avatarId: rec.profile.avatarId ?? 0,
    customAvatarUrl: rec.profile.customAvatarUrl,
    accentColor: rec.profile.accentColor || '#C84B31',
    online,
    activeRoomCode,
  };
}

export function findRegisteredProfilesByQuery(
  rawQuery: string,
  excludePlayerId?: string,
  isOnlineFn?: (id: string) => boolean,
  getRoomFn?: (id: string) => string | null
): PublicPlayerSummary[] {
  const clean = rawQuery.replace(/^@+/, '').trim().normalize('NFKC').toLowerCase();
  if (!clean) return [];
  const store = ensureStore();
  const matches: PublicPlayerSummary[] = [];

  for (const rec of Object.values(store.records)) {
    const uname = rec.profile.username;
    const ulower = rec.profile.usernameLower ?? uname?.toLowerCase();
    if (!uname || !ulower || !rec.profile.onboardingCompleted) continue;
    if (excludePlayerId && rec.profile.id === excludePlayerId) continue;

    if (ulower === clean || ulower.includes(clean)) {
      matches.push({
        id: rec.profile.id,
        username: uname,
        avatarId: rec.profile.avatarId ?? 0,
        customAvatarUrl: rec.profile.customAvatarUrl,
        accentColor: rec.profile.accentColor || '#C84B31',
        online: isOnlineFn ? isOnlineFn(rec.profile.id) : false,
        activeRoomCode: getRoomFn ? getRoomFn(rec.profile.id) : null,
      });
    }
  }

  // Exact match first, then alphabetical
  matches.sort((a, b) => {
    const aExact = a.username.toLowerCase() === clean ? 0 : 1;
    const bExact = b.username.toLowerCase() === clean ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;
    return a.username.localeCompare(b.username);
  });

  return matches.slice(0, 12);
}

