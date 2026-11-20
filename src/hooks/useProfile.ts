import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  signInWithGoogle,
  signOutFirebase,
} from '../firebase';
import type { GameId, MatchOutcome, PlayerProfile, UserPreferences } from '../types/game';
import { computeMatchRewards, evaluateAchievements } from '../utils/gameRules';
import {
  buildMatchHistoryPayload,
  buildPrivateAccountPayload,
  buildPublicProfileCreateData,
  buildPublicProfileStatsPatch,
  buildUsernameFields,
} from '../utils/profileSanitizer';

const STORAGE_KEY = 'diwan_player_profile_v2';
const SESSION_KEY = 'diwan_session_token_v1';

function createDefaultProfile(): PlayerProfile {
  const randomId = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  return {
    id: randomId,
    name: 'لاعب مجلسنا',
    avatarId: 0,
    accentColor: '#C84B31',
    createdAt: new Date().toISOString(),
    usernameUpdatedAt: null,
    nextUsernameChangeAt: null,
    onboardingCompleted: false,
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
}

function getStoredSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function setStoredSessionToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(SESSION_KEY, token);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

function isPermissionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return msg.includes('permission') || msg.includes('insufficient');
}

function toIsoStringMaybe(val: unknown, fallback: string): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string' && val.length >= 10) {
    return val;
  }
  return fallback;
}

export function useProfile(preferences?: UserPreferences) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [profile, setProfile] = useState<PlayerProfile>(() => {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) || localStorage.getItem('diwan_player_profile_v1');
      if (raw) {
        return { ...createDefaultProfile(), ...JSON.parse(raw) };
      }
    } catch {
      // ignore storage errors
    }
    return createDefaultProfile();
  });

  const latestProfileRef = useRef(profile);
  latestProfileRef.current = profile;

  const latestPrefsRef = useRef(preferences);
  latestPrefsRef.current = preferences;

  // Sequential queue prevents concurrent getDoc/setDoc races on Firestore documents
  const syncQueueRef = useRef<Promise<void>>(Promise.resolve());
  const enqueueSync = useCallback((task: () => Promise<void>): Promise<void> => {
    const run = syncQueueRef.current.catch(() => undefined).then(task);
    syncQueueRef.current = run.catch(() => undefined);
    return run;
  }, []);

  const getBearerHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const sessionToken = getStoredSessionToken();
    if (sessionToken) {
      headers['x-diwan-session'] = sessionToken;
    }
    try {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        if (token) headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // fallback without token
    }
    return headers;
  }, []);

  const performFirestoreSync = useCallback(
    async (next: PlayerProfile, prefs?: UserPreferences) => {
      const user = auth.currentUser;
      if (!user || !user.emailVerified) return;

      const createPayload = buildPublicProfileCreateData(next, user.uid);
      if (!createPayload) return;

      const userPath = `users/${user.uid}`;
      const userRef = doc(db, 'users', user.uid);

      let snap;
      try {
        snap = await getDoc(userRef);
      } catch (error) {
        if (isPermissionError(error)) {
          handleFirestoreError(error, OperationType.GET, userPath);
        }
        return;
      }

      if (!snap.exists()) {
        try {
          await setDoc(userRef, {
            ...createPayload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          if (isPermissionError(error)) {
            handleFirestoreError(error, OperationType.CREATE, userPath);
          }
          return;
        }
      } else {
        const statsPatch = buildPublicProfileStatsPatch(next);
        try {
          await updateDoc(userRef, {
            ...statsPatch,
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          if (isPermissionError(error)) {
            handleFirestoreError(error, OperationType.UPDATE, userPath);
          }
          return;
        }
      }

      if (prefs) {
        const privPayload = buildPrivateAccountPayload(prefs, user.uid, user.email);
        if (!privPayload) return;

        const privPath = `users/${user.uid}/private/account`;
        const privRef = doc(db, 'users', user.uid, 'private', 'account');

        let privSnap;
        try {
          privSnap = await getDoc(privRef);
        } catch (error) {
          if (isPermissionError(error)) {
            handleFirestoreError(error, OperationType.GET, privPath);
          }
          return;
        }

        if (!privSnap.exists()) {
          try {
            await setDoc(privRef, {
              ...privPayload,
              updatedAt: serverTimestamp(),
            });
          } catch (error) {
            if (isPermissionError(error)) {
              handleFirestoreError(error, OperationType.CREATE, privPath);
            }
          }
        } else {
          try {
            await updateDoc(privRef, {
              ...privPayload,
              updatedAt: serverTimestamp(),
            });
          } catch (error) {
            if (isPermissionError(error)) {
              handleFirestoreError(error, OperationType.UPDATE, privPath);
            }
          }
        }
      }
    },
    []
  );

  const syncFirestoreProfile = useCallback(
    (next: PlayerProfile, prefs?: UserPreferences) => {
      return enqueueSync(() => performFirestoreSync(next, prefs));
    },
    [enqueueSync, performFirestoreSync]
  );

  // Persist locally & sync to server + Firestore
  const syncToServer = useCallback(
    async (next: PlayerProfile, prefs?: UserPreferences) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      try {
        const headers = await getBearerHeaders();
        await fetch('/api/profile', {
          method: 'POST',
          headers,
          body: JSON.stringify(next),
        });
      } catch {
        // offline fallback handled via localStorage
      }
      void syncFirestoreProfile(next, prefs);
    },
    [getBearerHeaders, syncFirestoreProfile]
  );

  // Firebase Auth State tracking & cloud hydration
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthReady(true);
      if (!user) return;

      let hydratedFromServer: PlayerProfile | null = null;
      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(user.uid)}`);
        if (res.ok) {
          const data = (await res.json()) as { profile: PlayerProfile | null };
          if (data.profile) {
            hydratedFromServer = data.profile;
          }
        }
      } catch {
        // ignore
      }

      let cloudPublic: Record<string, unknown> | null = null;
      const userPath = `users/${user.uid}`;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          cloudPublic = snap.data();
        }
      } catch (error) {
        if (isPermissionError(error)) {
          handleFirestoreError(error, OperationType.GET, userPath);
        }
      }

      const prev = latestProfileRef.current;
      const isSameUid = prev.uid === user.uid || prev.id === user.uid;
      const base: PlayerProfile = hydratedFromServer
        ? {
            ...(isSameUid ? prev : createDefaultProfile()),
            ...hydratedFromServer,
            matchHistory:
              isSameUid && (prev.matchHistory?.length ?? 0) > (hydratedFromServer.matchHistory?.length ?? 0)
                ? prev.matchHistory
                : hydratedFromServer.matchHistory ?? [],
          }
        : isSameUid
        ? prev
        : createDefaultProfile();

      setStoredSessionToken(null);

      let next: PlayerProfile = {
        ...base,
        id: user.uid,
        uid: user.uid,
        authMethod: 'google',
        isFirebaseLinked: true,
      };

      if (cloudPublic && typeof cloudPublic.username === 'string' && cloudPublic.username.length >= 3) {
        next = {
          ...next,
          name: cloudPublic.username,
          username: cloudPublic.username,
          usernameLower:
            typeof cloudPublic.usernameLower === 'string'
              ? cloudPublic.usernameLower
              : cloudPublic.username.toLowerCase(),
          avatarId:
            typeof cloudPublic.avatarId === 'number' ? cloudPublic.avatarId : next.avatarId,
          customAvatarUrl:
            typeof cloudPublic.customAvatarUrl === 'string' && cloudPublic.customAvatarUrl.startsWith('data:image/')
              ? cloudPublic.customAvatarUrl
              : next.customAvatarUrl,
          accentColor:
            typeof cloudPublic.accentColor === 'string'
              ? cloudPublic.accentColor
              : next.accentColor,
          wins: Math.max(next.wins, Number(cloudPublic.wins) || 0),
          losses: Math.max(next.losses, Number(cloudPublic.losses) || 0),
          draws: Math.max(next.draws, Number(cloudPublic.draws) || 0),
          totalPoints: Math.max(next.totalPoints, Number(cloudPublic.totalPoints) || 0),
          unlockedAchievements: Array.from(
            new Set([
              ...(next.unlockedAchievements ?? []),
              ...(Array.isArray(cloudPublic.unlockedAchievements)
                ? cloudPublic.unlockedAchievements.filter((v): v is string => typeof v === 'string')
                : []),
            ])
          ),
          usernameUpdatedAt:
            typeof cloudPublic.usernameUpdatedAt === 'string'
              ? cloudPublic.usernameUpdatedAt
              : next.usernameUpdatedAt ?? null,
          nextUsernameChangeAt:
            typeof cloudPublic.nextUsernameChangeAt === 'string'
              ? cloudPublic.nextUsernameChangeAt
              : next.nextUsernameChangeAt ?? null,
          createdAt: toIsoStringMaybe(cloudPublic.createdAt, next.createdAt),
          onboardingCompleted: true,
        };
      } else if (!hydratedFromServer?.username || !hydratedFromServer?.onboardingCompleted) {
        // Strictly enforce mandatory username selection after first-time Google Sign-In
        next = {
          ...next,
          username: undefined,
          usernameLower: undefined,
          onboardingCompleted: false,
        };
      }

      latestProfileRef.current = next;
      setProfile(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }

      if (next.onboardingCompleted && next.username) {
        void syncFirestoreProfile(next, latestPrefsRef.current);
      }
    });
    return () => unsub();
  }, [syncFirestoreProfile]);

  // Hydrate from server on initial load (supports session token or local profile ID cleanly)
  useEffect(() => {
    let active = true;
    const sessionToken = getStoredSessionToken();
    if (sessionToken) {
      fetch('/api/auth/me', { headers: { 'x-diwan-session': sessionToken } })
        .then((res) => (res.ok ? res.json() : null))
        .then((payload: { profile?: PlayerProfile | null } | null) => {
          const serverProf = payload?.profile ?? null;
          if (!active || !serverProf) return;
          latestProfileRef.current = serverProf;
          setProfile(serverProf);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverProf));
          } catch {
            // ignore
          }
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }

    fetch(`/api/profile/${encodeURIComponent(profile.id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { profile?: PlayerProfile | null } | null) => {
        const serverProf = payload?.profile ?? null;
        if (!active || !serverProf) return;
        setProfile((prev) => {
          const shouldMerge =
            serverProf.onboardingCompleted && !prev.onboardingCompleted
              ? true
              : (serverProf.matchHistory?.length ?? 0) > (prev.matchHistory?.length ?? 0);
          const merged = shouldMerge
            ? serverProf
            : { ...prev, ...serverProf, matchHistory: prev.matchHistory };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
          return merged;
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [profile.id]);

  // Debounced sync when preferences change in Settings (avoids spamming Firestore on slider drags)
  const prefsKey = preferences
    ? `${preferences.lang}|${preferences.theme}|${preferences.audio.muted}|${preferences.audio.sfxVolume}|${preferences.audio.musicEnabled}|${preferences.audio.musicVolume}`
    : '';
  const prevPrefsKeyRef = useRef<string>(prefsKey);

  useEffect(() => {
    if (!preferences || !profile.onboardingCompleted || !firebaseUser?.emailVerified) {
      prevPrefsKeyRef.current = prefsKey;
      return;
    }
    if (prevPrefsKeyRef.current === prefsKey) return;
    prevPrefsKeyRef.current = prefsKey;

    const timer = window.setTimeout(() => {
      void syncFirestoreProfile(latestProfileRef.current, latestPrefsRef.current);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [prefsKey, preferences, profile.onboardingCompleted, firebaseUser, syncFirestoreProfile]);

  const updateProfile = useCallback(
    (patch: Partial<Pick<PlayerProfile, 'name' | 'avatarId' | 'customAvatarUrl' | 'accentColor'>>) => {
      const next: PlayerProfile = { ...latestProfileRef.current, ...patch };
      latestProfileRef.current = next;
      setProfile(next);
      void syncToServer(next, latestPrefsRef.current);
    },
    [syncToServer]
  );

  const registerWithPassword = useCallback(
    async (params: {
      username: string;
      password: string;
      avatarId: number;
      customAvatarUrl?: string;
      accentColor: string;
    }) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        reason?: string;
        profile?: PlayerProfile;
        sessionToken?: string;
      };
      if (data.ok && data.profile) {
        if (data.sessionToken) setStoredSessionToken(data.sessionToken);
        latestProfileRef.current = data.profile;
        setProfile(data.profile);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.profile));
        } catch {
          // ignore
        }
      }
      return data;
    },
    []
  );

  const loginWithPassword = useCallback(
    async (params: { username: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        reason?: string;
        profile?: PlayerProfile;
        sessionToken?: string;
      };
      if (data.ok && data.profile) {
        if (data.sessionToken) setStoredSessionToken(data.sessionToken);
        latestProfileRef.current = data.profile;
        setProfile(data.profile);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.profile));
        } catch {
          // ignore
        }
      }
      return data;
    },
    []
  );

  const claimUsername = useCallback(
    async (params: {
      username: string;
      avatarId: number;
      customAvatarUrl?: string;
      accentColor: string;
      pin?: string;
    }) => {
      const headers = await getBearerHeaders();
      const res = await fetch('/api/username/claim', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          playerId: profile.id,
          username: params.username,
          avatarId: params.avatarId,
          customAvatarUrl: params.customAvatarUrl,
          accentColor: params.accentColor,
          pin: params.pin,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        reason?: string;
        profile?: PlayerProfile;
      };
      if (data.ok && data.profile) {
        latestProfileRef.current = data.profile;
        setProfile(data.profile);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.profile));
        } catch {
          // ignore
        }
        void syncFirestoreProfile(data.profile, latestPrefsRef.current);
      }
      return data;
    },
    [profile.id, getBearerHeaders, syncFirestoreProfile]
  );

  const changeUsername = useCallback(
    async (params: { username: string; pin?: string }) => {
      const headers = await getBearerHeaders();
      const res = await fetch('/api/username/change', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          playerId: profile.id,
          username: params.username,
          pin: params.pin,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        reason?: string;
        nextEligibleAt?: string;
        profile?: PlayerProfile;
      };
      if (data.ok && data.profile) {
        const updatedProfile = data.profile;
        latestProfileRef.current = updatedProfile;
        setProfile(updatedProfile);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
        } catch {
          // ignore
        }
        if (auth.currentUser && auth.currentUser.emailVerified) {
          const uid = auth.currentUser.uid;
          void enqueueSync(async () => {
            const userPath = `users/${uid}`;
            const userRef = doc(db, 'users', uid);
            let snap;
            try {
              snap = await getDoc(userRef);
            } catch (error) {
              if (isPermissionError(error)) {
                handleFirestoreError(error, OperationType.GET, userPath);
              }
              return;
            }
            if (!snap.exists()) {
              await performFirestoreSync(updatedProfile, latestPrefsRef.current);
              return;
            }
            const usernameFields = buildUsernameFields(updatedProfile);
            if (!usernameFields) return;
            try {
              await updateDoc(userRef, {
                ...usernameFields,
                updatedAt: serverTimestamp(),
              });
            } catch (error) {
              if (isPermissionError(error)) {
                handleFirestoreError(error, OperationType.UPDATE, userPath);
              }
            }
          });
        }
      }
      return data;
    },
    [profile.id, getBearerHeaders, enqueueSync, performFirestoreSync]
  );

  const setSecurityPin = useCallback(
    async (pin: string) => {
      const headers = await getBearerHeaders();
      const res = await fetch('/api/account/pin', {
        method: 'POST',
        headers,
        body: JSON.stringify({ playerId: profile.id, pin }),
      });
      if (res.ok) {
        setProfile((prev) => {
          const next = { ...prev, hasPin: true };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });
        return true;
      }
      return false;
    },
    [profile.id, getBearerHeaders]
  );

  const linkGoogleAccount = useCallback(async () => {
    const cred = await signInWithGoogle();
    return cred.user;
  }, []);

  const signOutAccount = useCallback(async () => {
    try {
      await signOutFirebase();
    } catch {
      // ignore if not signed into Firebase
    }
    setStoredSessionToken(null);
    const fresh = createDefaultProfile();
    latestProfileRef.current = fresh;
    setProfile(fresh);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const recordMatch = useCallback(
    (
      gameId: GameId,
      outcome: MatchOutcome,
      rawScore: number,
      mode: 'solo' | 'local' | 'online' = 'solo',
      opponentLabel?: string
    ): number => {
      const pointsEarned = computeMatchRewards(outcome, rawScore);
      const matchId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const playedAt = new Date().toISOString();

      const prev = latestProfileRef.current;
      const nextGamesPlayed = {
        ...prev.gamesPlayed,
        [gameId]: (prev.gamesPlayed[gameId] ?? 0) + 1,
      };
      const updated: PlayerProfile = {
        ...prev,
        wins: prev.wins + (outcome === 'win' ? 1 : 0),
        losses: prev.losses + (outcome === 'loss' ? 1 : 0),
        draws: prev.draws + (outcome === 'draw' ? 1 : 0),
        totalPoints: prev.totalPoints + pointsEarned,
        gamesPlayed: nextGamesPlayed,
        matchHistory: [
          {
            id: matchId,
            gameId,
            mode,
            outcome,
            pointsEarned,
            opponentLabel,
            playedAt,
          },
          ...prev.matchHistory,
        ].slice(0, 25),
      };
      updated.unlockedAchievements = evaluateAchievements(updated);
      latestProfileRef.current = updated;
      setProfile(updated);
      void syncToServer(updated, latestPrefsRef.current);

      const currentUser = auth.currentUser;
      const usernameReady = updated.username;
      if (currentUser && currentUser.emailVerified && usernameReady) {
        const matchPayload = buildMatchHistoryPayload({
          uid: currentUser.uid,
          gameId,
          mode,
          outcome,
          pointsEarned,
          opponentLabel,
          playedAt,
        });
        if (matchPayload) {
          const matchPath = `users/${currentUser.uid}/matches/${matchId}`;
          void enqueueSync(async () => {
            try {
              await setDoc(doc(db, 'users', currentUser.uid, 'matches', matchId), {
                ...matchPayload,
                createdAt: serverTimestamp(),
              });
            } catch (error) {
              if (isPermissionError(error)) {
                handleFirestoreError(error, OperationType.CREATE, matchPath);
              }
            }
          });
        }
      }

      return pointsEarned;
    },
    [syncToServer, enqueueSync]
  );

  return {
    profile,
    firebaseUser,
    authReady,
    getBearerHeaders,
    updateProfile,
    registerWithPassword,
    loginWithPassword,
    claimUsername,
    changeUsername,
    setSecurityPin,
    linkGoogleAccount,
    signOutAccount,
    recordMatch,
  };
}
