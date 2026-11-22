import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import { createServer as createViteServer } from 'vite';
import {
  changeRegisteredUsername,
  checkUsernameAvailability,
  claimInitialUsername,
  getPublicSummaryById,
  getStoredProfile,
  loginWithUsernamePassword,
  registerWithUsernamePassword,
  saveStoredProfile,
  setAccountSecurityPin,
} from './server/profileStore.ts';
import {
  apiRateLimiter,
  verifyFirebaseBearer,
  verifySessionToken,
} from './server/securityCrypto.ts';
import {
  createRoomFromServerInvite,
  getPlayerActiveRoom,
  getRoomSummary,
  handlePlayerDisconnect,
  handleWsMessage,
  isPlayerOnline,
  pushToPlayers,
  unregisterOnlineSocket,
} from './server/roomManager.ts';
import {
  addGroupMembers,
  createGroup,
  getSocialOverview,
  leaveGroup,
  postGroupMessage,
  removeFriend,
  respondFriendRequest,
  searchUsersForFriend,
  sendFriendRequest,
} from './server/socialStore.ts';
import type { GameId, PlayerProfile } from './src/types/game.ts';

function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress ?? 'local';
}

async function resolveCallerPlayerId(req: express.Request): Promise<string | null> {
  const sessionToken = req.headers['x-diwan-session'];
  if (typeof sessionToken === 'string' && sessionToken.trim()) {
    const pid = verifySessionToken(sessionToken);
    if (pid) return pid;
  }
  const verified = await verifyFirebaseBearer(req);
  if (verified?.uid) return verified.uid;
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // Allow Firebase OAuth popup window communication cleanly in modern browsers
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/ws')) {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    }
    next();
  });

  // Basic security headers for API responses
  app.use('/api', (_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Explicit route for Android Digital Asset Links (TWA verification)
  app.get('/.well-known/assetlinks.json', (_req, res) => {
    const prodPath = path.resolve(process.cwd(), 'dist', '.well-known', 'assetlinks.json');
    const pubPath = path.resolve(process.cwd(), 'public', '.well-known', 'assetlinks.json');
    const target = process.env.NODE_ENV === 'production' ? prodPath : pubPath;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(target, (err) => {
      if (err) {
        res.sendFile(pubPath);
      }
    });
  });

  // REST API routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Username + Password Authentication
  app.post('/api/auth/register', async (req, res) => {
    const ip = getClientIp(req);
    const limit = apiRateLimiter.check(`auth_reg:${ip}`, 15, 60_000);
    if (!limit.allowed) {
      res.status(429).json({ ok: false, error: 'rate_limited', retryAfterSec: limit.retryAfterSec });
      return;
    }

    const { username, password, avatarId, customAvatarUrl, accentColor } = req.body as {
      username?: string;
      password?: string;
      avatarId?: number;
      customAvatarUrl?: string;
      accentColor?: string;
    };

    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({ ok: false, error: 'invalid_payload' });
      return;
    }

    const outcome = await registerWithUsernamePassword({
      rawUsername: username,
      password,
      avatarId,
      customAvatarUrl,
      accentColor,
    });
    res.status(outcome.status).json(outcome);
  });

  app.post('/api/auth/login', async (req, res) => {
    const ip = getClientIp(req);
    const limit = apiRateLimiter.check(`auth_login:${ip}`, 20, 60_000);
    if (!limit.allowed) {
      res.status(429).json({ ok: false, error: 'rate_limited', retryAfterSec: limit.retryAfterSec });
      return;
    }

    const { username, password } = req.body as { username?: string; password?: string };
    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({ ok: false, error: 'invalid_payload' });
      return;
    }

    const outcome = await loginWithUsernamePassword({ rawUsername: username, password });
    res.status(outcome.status).json(outcome);
  });

  app.get('/api/auth/me', async (req, res) => {
    const callerId = await resolveCallerPlayerId(req);
    if (!callerId) {
      res.json({ profile: null });
      return;
    }
    res.json({ profile: getStoredProfile(callerId) });
  });

  app.get('/api/profile/:id', (req, res) => {
    const profile = getStoredProfile(req.params.id);
    // Return 200 cleanly when profile does not yet exist to avoid noisy client 404 console errors
    res.json({ profile });
  });

  app.post('/api/profile', async (req, res) => {
    const ip = getClientIp(req);
    const limit = apiRateLimiter.check(`profile:${ip}`, 40, 60_000);
    if (!limit.allowed) {
      res.status(429).json({ error: 'rate_limited', retryAfterSec: limit.retryAfterSec });
      return;
    }
    const body = req.body as PlayerProfile;
    if (!body || typeof body.id !== 'string' || !body.id.trim()) {
      res.status(400).json({ error: 'Invalid profile payload' });
      return;
    }
    const verified = await verifyFirebaseBearer(req);
    if (verified?.uid && body.uid && verified.uid !== body.uid) {
      res.status(403).json({ error: 'uid_mismatch' });
      return;
    }
    const sessionPid = verifySessionToken(
      typeof req.headers['x-diwan-session'] === 'string' ? req.headers['x-diwan-session'] : undefined
    );
    if (sessionPid && sessionPid !== body.id) {
      res.status(403).json({ error: 'session_mismatch' });
      return;
    }
    const saved = saveStoredProfile(body);
    res.json(saved);
  });

  app.get('/api/username/check', (req, res) => {
    const ip = getClientIp(req);
    const limit = apiRateLimiter.check(`uname_check:${ip}`, 60, 60_000);
    if (!limit.allowed) {
      res.status(429).json({ error: 'rate_limited', retryAfterSec: limit.retryAfterSec });
      return;
    }
    const raw = String(req.query.username ?? '');
    const requesterId = typeof req.query.playerId === 'string' ? req.query.playerId : undefined;
    const rawMode = typeof req.query.mode === 'string' ? req.query.mode : 'register';
    const mode =
      rawMode === 'entry' || rawMode === 'claim' || rawMode === 'rename' ? rawMode : 'register';
    const result = checkUsernameAvailability(raw, requesterId, mode);
    res.json(result);
  });

  app.post('/api/username/claim', async (req, res) => {
    const ip = getClientIp(req);
    const limit = apiRateLimiter.check(`uname_claim:${ip}`, 15, 60_000);
    if (!limit.allowed) {
      res.status(429).json({ error: 'rate_limited', retryAfterSec: limit.retryAfterSec });
      return;
    }

    const { playerId, username, avatarId, customAvatarUrl, accentColor, pin } = req.body as {
      playerId?: string;
      username?: string;
      avatarId?: number;
      customAvatarUrl?: string;
      accentColor?: string;
      pin?: string;
    };

    if (!playerId || typeof playerId !== 'string' || typeof username !== 'string') {
      res.status(400).json({ error: 'invalid_payload' });
      return;
    }

    const verified = await verifyFirebaseBearer(req);
    const effectivePlayerId = verified?.uid ?? playerId;
    const outcome = await claimInitialUsername({
      playerId: effectivePlayerId,
      uid: verified?.uid,
      email: verified?.email,
      rawUsername: username,
      avatarId,
      customAvatarUrl,
      accentColor,
      pin,
    });

    res.status(outcome.status).json(outcome);
  });

  app.post('/api/username/change', async (req, res) => {
    const ip = getClientIp(req);
    const limit = apiRateLimiter.check(`uname_change:${ip}`, 10, 60_000);
    if (!limit.allowed) {
      res.status(429).json({ error: 'rate_limited', retryAfterSec: limit.retryAfterSec });
      return;
    }

    const { playerId, username, pin } = req.body as {
      playerId?: string;
      username?: string;
      pin?: string;
    };

    if (!playerId || typeof playerId !== 'string' || typeof username !== 'string') {
      res.status(400).json({ error: 'invalid_payload' });
      return;
    }

    const verified = await verifyFirebaseBearer(req);
    const existing = getStoredProfile(playerId);
    if (existing?.uid && verified?.uid && existing.uid !== verified.uid) {
      res.status(403).json({ error: 'forbidden' });
      return;
    }

    const outcome = await changeRegisteredUsername({
      playerId,
      rawUsername: username,
      pin,
    });
    res.status(outcome.status).json(outcome);
  });

  app.post('/api/account/pin', async (req, res) => {
    const ip = getClientIp(req);
    const limit = apiRateLimiter.check(`pin:${ip}`, 10, 60_000);
    if (!limit.allowed) {
      res.status(429).json({ error: 'rate_limited', retryAfterSec: limit.retryAfterSec });
      return;
    }
    const { playerId, pin } = req.body as { playerId?: string; pin?: string };
    if (!playerId || !pin) {
      res.status(400).json({ error: 'invalid_payload' });
      return;
    }
    const outcome = await setAccountSecurityPin(playerId, pin);
    res.status(outcome.status).json(outcome);
  });

  // Friends & Groups Social REST Endpoints
  app.get('/api/social/overview', async (req, res) => {
    const callerId = await resolveCallerPlayerId(req);
    const fallbackId = typeof req.query.playerId === 'string' ? req.query.playerId : null;
    const playerId = callerId ?? fallbackId;
    if (!playerId) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    const overview = getSocialOverview(playerId, isPlayerOnline, getPlayerActiveRoom);
    res.json(overview);
  });

  app.get('/api/friends/search', async (req, res) => {
    const callerId = await resolveCallerPlayerId(req);
    const fallbackId = typeof req.query.playerId === 'string' ? req.query.playerId : null;
    const playerId = callerId ?? fallbackId;
    const q = String(req.query.q ?? '');
    if (!playerId) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    const results = searchUsersForFriend(q, playerId, isPlayerOnline, getPlayerActiveRoom);
    res.json({ results });
  });

  app.post('/api/friends/request', async (req, res) => {
    const ip = getClientIp(req);
    const limit = apiRateLimiter.check(`freq:${ip}`, 30, 60_000);
    if (!limit.allowed) {
      res.status(429).json({ ok: false, error: 'rate_limited' });
      return;
    }
    const callerId = await resolveCallerPlayerId(req);
    const { playerId: bodyPlayerId, targetUsername } = req.body as {
      playerId?: string;
      targetUsername?: string;
    };
    const playerId = callerId ?? bodyPlayerId;
    if (!playerId || !targetUsername) {
      res.status(400).json({ ok: false, error: 'invalid_payload' });
      return;
    }
    const result = sendFriendRequest(playerId, targetUsername);
    if (result.ok && result.targetPlayerId) {
      const fromUser = getPublicSummaryById(playerId, isPlayerOnline(playerId), getPlayerActiveRoom(playerId));
      pushToPlayers([result.targetPlayerId, playerId], {
        type: 'social_update',
        event: result.autoAccepted ? 'friend_request_accepted' : 'friend_request_received',
        fromUsername: fromUser?.username,
        targetPlayerId: result.targetPlayerId,
      });
    }
    res.status(result.status).json(result);
  });

  app.post('/api/friends/respond', async (req, res) => {
    const callerId = await resolveCallerPlayerId(req);
    const { playerId: bodyPlayerId, requestId, action } = req.body as {
      playerId?: string;
      requestId?: string;
      action?: 'accept' | 'decline' | 'cancel';
    };
    const playerId = callerId ?? bodyPlayerId;
    if (!playerId || !requestId || !action) {
      res.status(400).json({ ok: false, error: 'invalid_payload' });
      return;
    }
    const result = respondFriendRequest(playerId, requestId, action);
    if (result.ok && result.notifyPlayerIds) {
      pushToPlayers(result.notifyPlayerIds, {
        type: 'social_update',
        event: `friend_request_${action}`,
      });
    }
    res.status(result.status).json(result);
  });

  app.delete('/api/friends/:friendId', async (req, res) => {
    const callerId = await resolveCallerPlayerId(req);
    const fallbackId = typeof req.query.playerId === 'string' ? req.query.playerId : null;
    const playerId = callerId ?? fallbackId;
    if (!playerId) {
      res.status(401).json({ ok: false, error: 'unauthorized' });
      return;
    }
    removeFriend(playerId, req.params.friendId);
    pushToPlayers([playerId, req.params.friendId], { type: 'social_update', event: 'friend_removed' });
    res.json({ ok: true });
  });

  app.post('/api/groups', async (req, res) => {
    const callerId = await resolveCallerPlayerId(req);
    const { playerId: bodyPlayerId, name, memberIds } = req.body as {
      playerId?: string;
      name?: string;
      memberIds?: string[];
    };
    const playerId = callerId ?? bodyPlayerId;
    if (!playerId || typeof name !== 'string') {
      res.status(400).json({ ok: false, error: 'invalid_payload' });
      return;
    }
    const outcome = createGroup({
      ownerId: playerId,
      name,
      memberIds: Array.isArray(memberIds) ? memberIds : [],
    });
    if (outcome.ok && outcome.group) {
      pushToPlayers(outcome.group.memberIds, {
        type: 'social_update',
        event: 'group_created',
        groupId: outcome.group.id,
      });
    }
    res.status(outcome.status).json(outcome);
  });

  app.post('/api/groups/:groupId/members', async (req, res) => {
    const callerId = await resolveCallerPlayerId(req);
    const { playerId: bodyPlayerId, memberIds, usernames } = req.body as {
      playerId?: string;
      memberIds?: string[];
      usernames?: string[];
    };
    const playerId = callerId ?? bodyPlayerId;
    const hasIds = Array.isArray(memberIds) && memberIds.length > 0;
    const hasUsernames = Array.isArray(usernames) && usernames.length > 0;
    if (!playerId || (!hasIds && !hasUsernames)) {
      res.status(400).json({ ok: false, error: 'invalid_payload' });
      return;
    }
    const outcome = addGroupMembers(playerId, req.params.groupId, {
      memberIds: Array.isArray(memberIds) ? memberIds : [],
      usernames: Array.isArray(usernames) ? usernames : [],
    });
    if (outcome.ok && outcome.group) {
      pushToPlayers(outcome.group.memberIds, {
        type: 'social_update',
        event: 'group_updated',
        groupId: outcome.group.id,
      });
    }
    res.status(outcome.status).json(outcome);
  });

  app.post('/api/groups/:groupId/leave', async (req, res) => {
    const callerId = await resolveCallerPlayerId(req);
    const { playerId: bodyPlayerId } = req.body as { playerId?: string };
    const playerId = callerId ?? bodyPlayerId;
    if (!playerId) {
      res.status(401).json({ ok: false, error: 'unauthorized' });
      return;
    }
    const outcome = leaveGroup(playerId, req.params.groupId);
    if (outcome.ok) {
      pushToPlayers(outcome.notifyMemberIds, {
        type: 'social_update',
        event: 'group_updated',
        groupId: req.params.groupId,
      });
    }
    res.status(outcome.status).json(outcome);
  });

  app.post('/api/groups/:groupId/messages', async (req, res) => {
    const callerId = await resolveCallerPlayerId(req);
    const { playerId: bodyPlayerId, text } = req.body as { playerId?: string; text?: string };
    const playerId = callerId ?? bodyPlayerId;
    if (!playerId || typeof text !== 'string') {
      res.status(400).json({ ok: false, error: 'invalid_payload' });
      return;
    }
    const outcome = postGroupMessage({
      senderId: playerId,
      groupId: req.params.groupId,
      type: 'text',
      text,
    });
    if (outcome.ok && outcome.message && outcome.memberIds) {
      pushToPlayers(outcome.memberIds, {
        type: 'group_message',
        groupId: req.params.groupId,
        groupName: outcome.groupName,
        message: outcome.message,
      });
    }
    res.status(outcome.status).json(outcome);
  });

  app.post('/api/groups/:groupId/invite-room', async (req, res) => {
    const callerId = await resolveCallerPlayerId(req);
    const { playerId: bodyPlayerId, gameId, existingRoomCode, roomName } = req.body as {
      playerId?: string;
      gameId?: GameId;
      existingRoomCode?: string;
      roomName?: string;
    };
    const playerId = callerId ?? bodyPlayerId;
    if (!playerId) {
      res.status(401).json({ ok: false, error: 'unauthorized' });
      return;
    }

    const hostProfile = getStoredProfile(playerId);
    if (!hostProfile) {
      res.status(404).json({ ok: false, error: 'profile_not_found' });
      return;
    }

    const chosenGame: GameId = gameId || 'xo';
    let targetRoomSummary = existingRoomCode ? getRoomSummary(existingRoomCode) : null;
    if (!targetRoomSummary) {
      const created = createRoomFromServerInvite({
        host: {
          id: hostProfile.id,
          name: hostProfile.username || hostProfile.name,
          avatarId: hostProfile.avatarId,
          customAvatarUrl: hostProfile.customAvatarUrl,
          accentColor: hostProfile.accentColor,
        },
        roomName: roomName?.trim() || `${hostProfile.username || hostProfile.name}`,
        selectedGame: chosenGame,
        maxPlayers: 8,
      });
      targetRoomSummary = {
        code: created.code,
        name: created.name,
        playerCount: created.players.length,
        maxPlayers: created.maxPlayers,
        status: created.status,
        selectedGame: created.selectedGame,
      };
    }

    const invitePayload = {
      roomCode: targetRoomSummary.code,
      roomName: targetRoomSummary.name,
      gameId: targetRoomSummary.selectedGame,
      hostName: hostProfile.username || hostProfile.name,
    };

    const outcome = postGroupMessage({
      senderId: playerId,
      groupId: req.params.groupId,
      type: 'room_invite',
      text: `${invitePayload.hostName} → ${invitePayload.roomCode}`,
      roomInvite: invitePayload,
    });

    if (outcome.ok && outcome.message && outcome.memberIds) {
      pushToPlayers(outcome.memberIds, {
        type: 'group_message',
        groupId: req.params.groupId,
        groupName: outcome.groupName,
        message: outcome.message,
      });
      pushToPlayers(
        outcome.memberIds.filter((id) => id !== playerId),
        {
          type: 'group_room_invite',
          groupId: req.params.groupId,
          groupName: outcome.groupName,
          invite: invitePayload,
        }
      );
    }

    res.status(outcome.status).json({
      ...outcome,
      roomCode: invitePayload.roomCode,
      invite: invitePayload,
    });
  });

  app.get('/api/rooms/:code', (req, res) => {
    const summary = getRoomSummary(req.params.code);
    if (!summary) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    res.json(summary);
  });

  const server = http.createServer(app);

  // Real-time WebSocket Server on /ws
  const wss = new WebSocketServer({ server, path: '/ws' });
  wss.on('connection', (ws) => {
    const clientMeta: { roomCode?: string; playerId?: string } = {};

    ws.on('message', (data) => {
      handleWsMessage(ws, data.toString(), clientMeta);
    });

    ws.on('close', () => {
      unregisterOnlineSocket(ws, clientMeta.playerId);
      handlePlayerDisconnect(clientMeta.roomCode, clientMeta.playerId, false);
    });
  });

  // Vite dev middleware or static production dist
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath, { dotfiles: 'allow' }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Majlisna server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
