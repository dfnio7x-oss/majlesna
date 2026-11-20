import test from 'node:test';
import assert from 'node:assert/strict';
import type { PlayerProfile, UserPreferences } from '../types/game';
import {
  buildMatchHistoryPayload,
  buildPrivateAccountPayload,
  buildPublicProfileCreateData,
  buildPublicProfileStatsPatch,
  isValidFirebaseUid,
} from './profileSanitizer';

function makeBaseProfile(overrides: Partial<PlayerProfile> = {}): PlayerProfile {
  return {
    id: 'NHqMwiiCo8WvZokYguH6PVIUDlR2',
    uid: 'NHqMwiiCo8WvZokYguH6PVIUDlR2',
    name: 'Hero_123',
    username: 'Hero_123',
    usernameLower: 'hero_123',
    avatarId: 2,
    accentColor: '#C84B31',
    createdAt: '2026-11-18T08:00:00.000Z',
    usernameUpdatedAt: '2026-11-18T08:00:00.000Z',
    nextUsernameChangeAt: '2026-11-25T08:00:00.000Z',
    onboardingCompleted: true,
    isFirebaseLinked: true,
    hasPin: false,
    wins: 3,
    losses: 1,
    draws: 2,
    totalPoints: 450,
    gamesPlayed: { xo: 4, rps: 2 },
    unlockedAchievements: ['first-match', 'first-win'],
    matchHistory: [],
    ...overrides,
  };
}

test('isValidFirebaseUid validates ID pattern and rejects invalid IDs', () => {
  assert.equal(isValidFirebaseUid('NHqMwiiCo8WvZokYguH6PVIUDlR2'), true);
  assert.equal(isValidFirebaseUid(''), false);
  assert.equal(isValidFirebaseUid('bad/uid'), false);
});

test('buildPublicProfileCreateData produces schema-compliant payload and clamps values', () => {
  const dirty = makeBaseProfile({
    avatarId: 99,
    accentColor: 'x',
    wins: -5,
    totalPoints: 120.7,
    unlockedAchievements: ['', 'first-match'],
    usernameUpdatedAt: null,
    nextUsernameChangeAt: null,
  });

  const payload = buildPublicProfileCreateData(dirty, 'NHqMwiiCo8WvZokYguH6PVIUDlR2');
  assert.ok(payload);
  assert.equal(payload.avatarId, 24);
  assert.equal(payload.accentColor, '#C84B31');
  assert.equal(payload.wins, 0);
  assert.equal(payload.totalPoints, 120);
  assert.equal(payload.gamesPlayedCount, 6);
  assert.deepEqual(payload.unlockedAchievements, ['first-match']);
  assert.equal('usernameUpdatedAt' in payload, false);
  assert.equal('nextUsernameChangeAt' in payload, false);
});

test('buildPublicProfileCreateData returns null when username is missing or too short', () => {
  assert.equal(buildPublicProfileCreateData(makeBaseProfile({ username: 'ab' }), 'NHqMwiiCo8WvZokYguH6PVIUDlR2'), null);
  assert.equal(buildPublicProfileCreateData(makeBaseProfile({ username: undefined }), 'NHqMwiiCo8WvZokYguH6PVIUDlR2'), null);
});

test('buildPublicProfileStatsPatch restricts keys to stats and look fields', () => {
  const patch = buildPublicProfileStatsPatch(makeBaseProfile());
  assert.deepEqual(Object.keys(patch).sort(), [
    'accentColor',
    'avatarId',
    'draws',
    'gamesPlayedCount',
    'losses',
    'totalPoints',
    'unlockedAchievements',
    'wins',
  ]);
});

test('buildPrivateAccountPayload clamps audio volumes and omits empty email', () => {
  const prefs: UserPreferences = {
    lang: 'ar',
    theme: 'dark',
    audio: {
      muted: false,
      sfxVolume: 1.5,
      musicEnabled: true,
      musicVolume: -0.2,
    },
  };
  const payload = buildPrivateAccountPayload(prefs, 'NHqMwiiCo8WvZokYguH6PVIUDlR2', '');
  assert.ok(payload);
  assert.equal(payload.sfxVolume, 1);
  assert.equal(payload.musicVolume, 0);
  assert.equal('email' in payload, false);
});

test('buildMatchHistoryPayload omits empty opponentLabel and rounds points', () => {
  const payload = buildMatchHistoryPayload({
    uid: 'NHqMwiiCo8WvZokYguH6PVIUDlR2',
    gameId: 'xo',
    mode: 'solo',
    outcome: 'win',
    pointsEarned: 45.8,
    opponentLabel: '   ',
    playedAt: '2026-11-18T08:00:00.000Z',
  });
  assert.ok(payload);
  assert.equal(payload.pointsEarned, 45);
  assert.equal('opponentLabel' in payload, false);
});
