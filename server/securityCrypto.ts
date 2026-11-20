import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { hash as argon2Hash, verify as argon2Verify } from '@node-rs/argon2';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { Request } from 'express';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SECRETS_FILE = path.join(DATA_DIR, '.server-secrets.json');

interface ServerSecrets {
  encryptionKeyHex: string;
  hmacKeyHex: string;
}

let cachedSecrets: ServerSecrets | null = null;

function getServerSecrets(): ServerSecrets {
  if (cachedSecrets) return cachedSecrets;

  const envEnc = process.env.DIWAN_ENCRYPTION_KEY?.trim();
  const envHmac = process.env.DIWAN_HMAC_KEY?.trim();
  if (envEnc && /^[a-fA-F0-9]{64}$/.test(envEnc) && envHmac && /^[a-fA-F0-9]{64}$/.test(envHmac)) {
    cachedSecrets = { encryptionKeyHex: envEnc, hmacKeyHex: envHmac };
    return cachedSecrets;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(SECRETS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(SECRETS_FILE, 'utf-8')) as ServerSecrets;
      if (parsed.encryptionKeyHex && parsed.hmacKeyHex) {
        cachedSecrets = parsed;
        return cachedSecrets;
      }
    }
    const generated: ServerSecrets = {
      encryptionKeyHex: crypto.randomBytes(32).toString('hex'),
      hmacKeyHex: crypto.randomBytes(32).toString('hex'),
    };
    fs.writeFileSync(SECRETS_FILE, JSON.stringify(generated, null, 2), { encoding: 'utf-8', mode: 0o600 });
    cachedSecrets = generated;
    return cachedSecrets;
  } catch {
    // Ephemeral fallback if filesystem is read-only
    cachedSecrets = {
      encryptionKeyHex: crypto.createHash('sha256').update(process.cwd() + ':enc').digest('hex'),
      hmacKeyHex: crypto.createHash('sha256').update(process.cwd() + ':hmac').digest('hex'),
    };
    return cachedSecrets;
  }
}

/**
 * Encrypts sensitive data using AES-256-GCM with a random 96-bit IV and authentication tag.
 */
export function encryptSensitive(plaintext: string): string {
  const { encryptionKeyHex } = getServerSecrets();
  const key = Buffer.from(encryptionKeyHex, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

/**
 * Decrypts AES-256-GCM encrypted envelope on server only.
 */
export function decryptSensitive(envelope: string): string | null {
  try {
    const [ivB64, tagB64, dataB64] = envelope.split('.');
    if (!ivB64 || !tagB64 || !dataB64) return null;
    const { encryptionKeyHex } = getServerSecrets();
    const key = Buffer.from(encryptionKeyHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64url')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    return null;
  }
}

/**
 * Computes deterministic HMAC-SHA256 blind index for normalized username uniqueness lookups.
 */
export function computeUsernameBlindIndex(normalizedUsername: string): string {
  const { hmacKeyHex } = getServerSecrets();
  return crypto
    .createHmac('sha256', Buffer.from(hmacKeyHex, 'hex'))
    .update(`diwan:username:v1:${normalizedUsername}`)
    .digest('hex');
}

/**
 * Hashes secret credentials / PINs using Argon2id.
 */
export async function hashSecretArgon2id(secret: string): Promise<string> {
  return argon2Hash(secret, {
    algorithm: 2, // Argon2id
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifySecretArgon2id(hashValue: string, secret: string): Promise<boolean> {
  try {
    return await argon2Verify(hashValue, secret);
  } catch {
    return false;
  }
}

// Reserved & disallowed terms (EN + AR)
const RESERVED_WORDS = new Set([
  'admin',
  'administrator',
  'mod',
  'moderator',
  'system',
  'diwan',
  'diwanplay',
  'majlisna',
  'support',
  'staff',
  'root',
  'owner',
  'official',
  'security',
  'firebase',
  'null',
  'undefined',
  'guest',
  'bot',
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'whore',
  'ادمن',
  'مشرف',
  'النظام',
  'ديوان',
  'مجلسنا',
  'الدعم',
  'الادارة',
  'الإدارة',
  'الرسمي',
  'كلب',
  'حمار',
  'غبي',
  'زفت',
  'شرموط',
  'كس',
  'طيز',
]);

export interface UsernameValidationResult {
  valid: boolean;
  normalized: string;
  reason?: 'too_short' | 'too_long' | 'invalid_chars' | 'reserved';
}

export function normalizeUsername(raw: string): string {
  return raw.trim().normalize('NFKC').toLowerCase();
}

export function validateUsernameFormat(raw: string): UsernameValidationResult {
  const trimmed = raw.trim().normalize('NFKC');
  const normalized = trimmed.toLowerCase();

  if (trimmed.length < 3) {
    return { valid: false, normalized, reason: 'too_short' };
  }
  if (trimmed.length > 16) {
    return { valid: false, normalized, reason: 'too_long' };
  }
  // Allow Arabic letters, Latin letters, digits, underscore, and dot (no leading/trailing/consecutive punctuation)
  const validPattern = /^(?!.*[_.]{2})(?![_.])[\p{L}\p{N}_.]{3,16}(?<![_.])$/u;
  if (!validPattern.test(trimmed)) {
    return { valid: false, normalized, reason: 'invalid_chars' };
  }
  for (const banned of RESERVED_WORDS) {
    if (normalized === banned || normalized.includes(banned)) {
      return { valid: false, normalized, reason: 'reserved' };
    }
  }
  return { valid: true, normalized };
}

// Sliding-window in-memory rate limiter
export class SlidingRateLimiter {
  private buckets = new Map<string, number[]>();

  public check(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfterSec: number } {
    const now = Date.now();
    const cutoff = now - windowMs;
    const prev = (this.buckets.get(key) ?? []).filter((ts) => ts > cutoff);
    if (prev.length >= maxRequests) {
      const oldest = prev[0] ?? now;
      return {
        allowed: false,
        retryAfterSec: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
      };
    }
    prev.push(now);
    this.buckets.set(key, prev);
    return { allowed: true, retryAfterSec: 0 };
  }
}

export const apiRateLimiter = new SlidingRateLimiter();

// Firebase ID token verification (requires zero IAM permissions)
let firebaseAdminInitTried = false;
let firebaseAdminProjectId: string | null = null;

function ensureFirebaseAdminAuth() {
  if (!firebaseAdminInitTried) {
    firebaseAdminInitTried = true;
    try {
      const cfgPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
      if (fs.existsSync(cfgPath)) {
        const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8')) as { projectId?: string };
        if (cfg.projectId && cfg.projectId !== 'remixed-project-id') {
          firebaseAdminProjectId = cfg.projectId;
          if (!getApps().length) {
            initializeApp({ projectId: cfg.projectId });
          }
        }
      }
    } catch {
      firebaseAdminProjectId = null;
    }
  }
  if (!firebaseAdminProjectId) return null;
  try {
    return getAuth(getApp());
  } catch {
    return null;
  }
}

export interface VerifiedCaller {
  uid?: string;
  email?: string;
  emailVerified?: boolean;
}

export async function verifyFirebaseBearer(req: Request): Promise<VerifiedCaller | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  const authService = ensureFirebaseAdminAuth();
  if (!authService) return null;
  try {
    const decoded = await authService.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified,
    };
  } catch {
    return null;
  }
}

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function issueSessionToken(playerId: string): string {
  const { hmacKeyHex } = getServerSecrets();
  const payload = Buffer.from(
    JSON.stringify({ pid: playerId, exp: Date.now() + SESSION_TTL_MS }),
    'utf8'
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', Buffer.from(hmacKeyHex, 'hex'))
    .update(`diwan:session:v1:${payload}`)
    .digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token?: string | null): string | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  if (!payload || !sig) return null;

  try {
    const { hmacKeyHex } = getServerSecrets();
    const expectedSig = crypto
      .createHmac('sha256', Buffer.from(hmacKeyHex, 'hex'))
      .update(`diwan:session:v1:${payload}`)
      .digest('base64url');

    const sigBuf = Buffer.from(sig, 'utf8');
    const expBuf = Buffer.from(expectedSig, 'utf8');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      pid?: unknown;
      exp?: unknown;
    };
    if (typeof decoded.pid !== 'string' || !decoded.pid.trim()) return null;
    if (typeof decoded.exp !== 'number' || decoded.exp < Date.now()) return null;
    return decoded.pid;
  } catch {
    return null;
  }
}

export function sanitizeCustomAvatarUrl(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > 65000) return undefined;
  if (!/^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

