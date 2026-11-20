import type { WebSocket } from 'ws';
import type { ChatMessage, DrawStroke, GameId, RoomPlayer, RoomState } from '../src/types/game.ts';
import {
  assignMafiaRoles,
  checkMafiaWin,
  checkXOWinner,
  evaluateNumberGuess,
  resolveRPS,
  type MafiaPlayerState,
  type RPSChoice,
  type XOCell,
} from '../src/utils/gameRules.ts';
import { DRAW_PROMPTS, LETTER_CHALLENGE_POOL } from '../src/data/questionBank.ts';

import { sanitizeCustomAvatarUrl } from './securityCrypto.ts';

interface InternalRoom extends RoomState {
  sockets: Map<string, WebSocket>;
  secrets: {
    numberTarget?: number;
    rpsChoices?: Record<string, RPSChoice>;
    drawWord?: string;
    drawWordEn?: string;
    mafiaRoles?: Record<string, 'mafia' | 'detective' | 'doctor' | 'citizen'>;
    mafiaNightActions?: {
      mafiaTarget?: string;
      doctorSave?: string;
      detectiveCheck?: string;
    };
    mafiaVotes?: Record<string, string>;
  };
}

const rooms = new Map<string, InternalRoom>();
const onlineUserSockets = new Map<string, Set<WebSocket>>();

function broadcastPresenceChange(playerId: string): void {
  if (!playerId) return;
  const payload = JSON.stringify({
    type: 'presence_changed',
    playerId,
    online: isPlayerOnline(playerId),
    activeRoomCode: getPlayerActiveRoom(playerId),
  });
  const seen = new Set<WebSocket>();
  for (const sockets of onlineUserSockets.values()) {
    for (const ws of sockets) {
      if (!seen.has(ws) && ws.readyState === 1) {
        seen.add(ws);
        ws.send(payload);
      }
    }
  }
}

export function registerOnlineSocket(ws: WebSocket, playerId: string): void {
  if (!playerId) return;
  const wasOnline = isPlayerOnline(playerId);
  let set = onlineUserSockets.get(playerId);
  if (!set) {
    set = new Set();
    onlineUserSockets.set(playerId, set);
  }
  set.add(ws);
  if (!wasOnline && isPlayerOnline(playerId)) {
    broadcastPresenceChange(playerId);
  }
}

export function unregisterOnlineSocket(ws: WebSocket, playerId?: string): void {
  if (!playerId) return;
  const set = onlineUserSockets.get(playerId);
  if (!set || !set.has(ws)) return;
  set.delete(ws);
  for (const sock of Array.from(set)) {
    if (sock.readyState !== 1) set.delete(sock);
  }
  if (set.size === 0) {
    onlineUserSockets.delete(playerId);
  }
  if (!isPlayerOnline(playerId)) {
    broadcastPresenceChange(playerId);
  }
}

export function isPlayerOnline(playerId: string): boolean {
  const set = onlineUserSockets.get(playerId);
  if (!set) return false;
  for (const ws of set) {
    if (ws.readyState === 1) return true;
  }
  return false;
}

export function getPlayerActiveRoom(playerId: string): string | null {
  for (const room of rooms.values()) {
    const p = room.players.find((pl) => pl.id === playerId);
    if (p && p.isConnected) return room.code;
  }
  return null;
}

export function pushToPlayers(playerIds: string[], payload: unknown): void {
  const seen = new Set<WebSocket>();
  for (const pid of playerIds) {
    const sockets = onlineUserSockets.get(pid);
    if (!sockets) continue;
    for (const ws of sockets) {
      if (!seen.has(ws) && ws.readyState === 1) {
        seen.add(ws);
        ws.send(JSON.stringify(payload));
      }
    }
  }
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(code) ? generateCode() : code;
}

function send(ws: WebSocket | undefined, payload: unknown): void {
  if (!ws || ws.readyState !== 1) return;
  ws.send(JSON.stringify(payload));
}

function sanitizeRoom(room: InternalRoom): RoomState {
  return {
    code: room.code,
    name: room.name,
    hostId: room.hostId,
    maxPlayers: room.maxPlayers,
    status: room.status,
    selectedGame: room.selectedGame,
    players: room.players,
    chat: room.chat.slice(-40),
    roundNumber: room.roundNumber,
    gameState: room.gameState,
  };
}

function broadcast(room: InternalRoom, payload?: unknown): void {
  const stateMsg = payload ?? { type: 'room_state', room: sanitizeRoom(room) };
  for (const ws of room.sockets.values()) {
    send(ws, stateMsg);
  }
}

function addSystemChat(room: InternalRoom, text: string): void {
  const msg: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    playerId: 'system',
    playerName: 'Majlisna',
    text,
    timestamp: Date.now(),
    isSystem: true,
  };
  room.chat.push(msg);
  if (room.chat.length > 50) room.chat.shift();
}

function initGameStateForRoom(room: InternalRoom): void {
  const game = room.selectedGame;
  room.roundNumber += 1;
  room.status = 'playing';
  room.secrets = {};

  for (const p of room.players) {
    p.roundScore = 0;
  }

  const seed = Math.floor(Math.random() * 1000000);

  if (game === 'xo') {
    const p1 = room.players[0]?.id ?? '';
    const p2 = room.players[1]?.id ?? '';
    room.gameState = {
      board: Array(9).fill(null) as XOCell[],
      turnPlayerId: p1,
      xPlayerId: p1,
      oPlayerId: p2,
      winner: null,
      winLine: null,
    };
  } else if (game === 'rps') {
    room.secrets.rpsChoices = {};
    room.gameState = {
      round: 1,
      maxRounds: 5,
      submittedIds: [],
      lastReveal: null,
    };
  } else if (game === 'number-guess') {
    room.secrets.numberTarget = Math.floor(Math.random() * 100) + 1;
    room.gameState = {
      guesses: [],
      winnerId: null,
      winnerName: null,
      targetRevealed: null,
    };
  } else if (game === 'draw-guess' || game === 'sketch-relay') {
    const drawer = room.players[(room.roundNumber - 1) % room.players.length];
    const idx = Math.floor(Math.random() * DRAW_PROMPTS.ar.length);
    room.secrets.drawWord = DRAW_PROMPTS.ar[idx];
    room.secrets.drawWordEn = DRAW_PROMPTS.en[idx];
    room.gameState = {
      drawerId: drawer?.id ?? room.hostId,
      drawerName: drawer?.name ?? '',
      strokes: [] as DrawStroke[],
      guessedIds: [],
      wordLengthAr: room.secrets.drawWord.length,
      wordLengthEn: room.secrets.drawWordEn.length,
      revealedWord: null,
    };
    const drawerWs = room.sockets.get(drawer?.id ?? '');
    send(drawerWs, {
      type: 'private_data',
      game: 'draw-guess',
      drawWordAr: room.secrets.drawWord,
      drawWordEn: room.secrets.drawWordEn,
    });
  } else if (game === 'mafia') {
    const ids = room.players.map((p) => p.id);
    const roles = assignMafiaRoles(ids);
    room.secrets.mafiaRoles = roles;
    room.secrets.mafiaNightActions = {};
    room.secrets.mafiaVotes = {};
    const mafiaPlayers: MafiaPlayerState[] = room.players.map((p) => ({
      id: p.id,
      name: p.name,
      role: roles[p.id],
      alive: true,
    }));
    room.gameState = {
      phase: 'night',
      dayNumber: 1,
      players: mafiaPlayers.map((mp) => ({ id: mp.id, name: mp.name, alive: mp.alive })),
      nightActedIds: [],
      votes: {},
      lastDawnSummary: null,
      winnerSide: null,
      revealedRoles: null,
    };
    for (const p of room.players) {
      send(room.sockets.get(p.id), {
        type: 'private_data',
        game: 'mafia',
        role: roles[p.id],
      });
    }
  } else if (game === 'secret-agent' || game === 'whos-liar') {
    const chosenIdx = seed % Math.max(1, room.players.length);
    const impostorId = room.players[chosenIdx]?.id ?? room.hostId;
    room.gameState = {
      seed,
      startedAt: Date.now(),
      impostorId,
      votes: {},
      submissions: {},
      finishedIds: [],
      revealed: false,
    };
    for (const p of room.players) {
      send(room.sockets.get(p.id), {
        type: 'private_data',
        game,
        isImpostor: p.id === impostorId,
        seed,
      });
    }
  } else if (game === 'letter-challenge') {
    const arLetter = LETTER_CHALLENGE_POOL.ar[Math.floor(Math.random() * LETTER_CHALLENGE_POOL.ar.length)];
    const enLetter = LETTER_CHALLENGE_POOL.en[Math.floor(Math.random() * LETTER_CHALLENGE_POOL.en.length)];
    room.gameState = {
      seed,
      arLetter,
      enLetter,
      startedAt: Date.now(),
      finishedIds: [],
    };
  } else {
    // Seeded synchronized games & collaborative party arenas across all 57 games
    room.gameState = {
      seed,
      startedAt: Date.now(),
      submissions: {},
      votes: {},
      storyEntries: [],
      finishedIds: [],
    };
  }
}

export function getRoomSummary(code: string) {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;
  return {
    code: room.code,
    name: room.name,
    playerCount: room.players.length,
    maxPlayers: room.maxPlayers,
    status: room.status,
    selectedGame: room.selectedGame,
  };
}

export function createRoomFromServerInvite(params: {
  host: { id: string; name: string; avatarId: number; customAvatarUrl?: string; accentColor: string };
  roomName: string;
  selectedGame: GameId;
  maxPlayers?: number;
}): RoomState {
  const code = generateCode();
  const hostPlayer: RoomPlayer = {
    id: params.host.id,
    name: params.host.name || 'Player',
    avatarId: params.host.avatarId ?? 0,
    customAvatarUrl: sanitizeCustomAvatarUrl(params.host.customAvatarUrl),
    accentColor: params.host.accentColor || '#C84B31',
    isHost: true,
    isReady: true,
    isConnected: false,
    score: 0,
    roundScore: 0,
  };
  const room: InternalRoom = {
    code,
    name: params.roomName.slice(0, 40) || 'Group Lounge',
    hostId: params.host.id,
    maxPlayers: Math.min(8, Math.max(2, params.maxPlayers ?? 6)),
    status: 'lobby',
    selectedGame: params.selectedGame || 'xo',
    players: [hostPlayer],
    chat: [],
    roundNumber: 0,
    gameState: {},
    sockets: new Map(),
    secrets: {},
  };
  addSystemChat(room, `${hostPlayer.name} created group room ${code}`);
  rooms.set(code, room);
  return sanitizeRoom(room);
}

export function handleWsMessage(ws: WebSocket, raw: string, clientMeta: { roomCode?: string; playerId?: string }): void {
  let msg: Record<string, unknown>;
  try {
    msg = JSON.parse(raw);
  } catch {
    return;
  }

  const type = String(msg.type || '');

  if (type === 'presence_hello') {
    const pid = String(msg.playerId || '').trim();
    if (pid) {
      clientMeta.playerId = pid;
      registerOnlineSocket(ws, pid);
    }
    return;
  }

  if (type === 'create_room') {
    const player = msg.player as {
      id: string;
      name: string;
      avatarId: number;
      customAvatarUrl?: string;
      accentColor: string;
    };
    const roomName = String(msg.roomName || 'Friends Lounge').slice(0, 40);
    const maxPlayers = Math.min(8, Math.max(2, Number(msg.maxPlayers) || 6));
    const selectedGame = (msg.selectedGame as GameId) || 'xo';
    const code = generateCode();

    registerOnlineSocket(ws, player.id);

    const hostPlayer: RoomPlayer = {
      id: player.id,
      name: player.name || 'Player',
      avatarId: player.avatarId ?? 0,
      customAvatarUrl: sanitizeCustomAvatarUrl(player.customAvatarUrl),
      accentColor: player.accentColor || '#C84B31',
      isHost: true,
      isReady: true,
      isConnected: true,
      score: 0,
      roundScore: 0,
    };

    const room: InternalRoom = {
      code,
      name: roomName,
      hostId: player.id,
      maxPlayers,
      status: 'lobby',
      selectedGame,
      players: [hostPlayer],
      chat: [],
      roundNumber: 0,
      gameState: {},
      sockets: new Map([[player.id, ws]]),
      secrets: {},
    };
    addSystemChat(room, `${hostPlayer.name} created room ${code}`);
    rooms.set(code, room);
    clientMeta.roomCode = code;
    clientMeta.playerId = player.id;
    send(ws, { type: 'room_joined', room: sanitizeRoom(room) });
    broadcastPresenceChange(player.id);
    return;
  }

  if (type === 'join_room') {
    const code = String(msg.code || '').trim().toUpperCase();
    const player = msg.player as {
      id: string;
      name: string;
      avatarId: number;
      customAvatarUrl?: string;
      accentColor: string;
    };
    const room = rooms.get(code);
    if (!room) {
      send(ws, { type: 'room_error', code: 'NOT_FOUND', message: 'Room not found' });
      return;
    }

    registerOnlineSocket(ws, player.id);
    const cleanAvatar = sanitizeCustomAvatarUrl(player.customAvatarUrl);

    const existing = room.players.find((p) => p.id === player.id);
    if (!existing && room.players.length >= room.maxPlayers) {
      send(ws, { type: 'room_error', code: 'ROOM_FULL', message: 'Room is full' });
      return;
    }

    if (existing) {
      existing.isConnected = true;
      existing.name = player.name || existing.name;
      existing.avatarId = player.avatarId ?? existing.avatarId;
      if (cleanAvatar !== undefined) existing.customAvatarUrl = cleanAvatar;
      existing.accentColor = player.accentColor || existing.accentColor;
    } else {
      room.players.push({
        id: player.id,
        name: player.name || 'Guest',
        avatarId: player.avatarId ?? 1,
        customAvatarUrl: cleanAvatar,
        accentColor: player.accentColor || '#2D6A4F',
        isHost: false,
        isReady: false,
        isConnected: true,
        score: 0,
        roundScore: 0,
      });
      addSystemChat(room, `${player.name || 'Guest'} joined`);
    }

    room.sockets.set(player.id, ws);
    clientMeta.roomCode = code;
    clientMeta.playerId = player.id;

    send(ws, { type: 'room_joined', room: sanitizeRoom(room) });
    broadcast(room, { type: 'player_joined', playerName: player.name, room: sanitizeRoom(room) });
    broadcastPresenceChange(player.id);

    // Resend private secret if mid-game
    if (room.status === 'playing' && room.selectedGame === 'draw-guess' && room.gameState.drawerId === player.id) {
      send(ws, {
        type: 'private_data',
        game: 'draw-guess',
        drawWordAr: room.secrets.drawWord,
        drawWordEn: room.secrets.drawWordEn,
      });
    }
    if (room.status === 'playing' && room.selectedGame === 'mafia' && room.secrets.mafiaRoles?.[player.id]) {
      send(ws, {
        type: 'private_data',
        game: 'mafia',
        role: room.secrets.mafiaRoles[player.id],
      });
    }
    return;
  }

  const roomCode = clientMeta.roomCode || String(msg.code || '').toUpperCase();
  const playerId = clientMeta.playerId || String(msg.playerId || '');
  const room = rooms.get(roomCode);
  if (!room || !playerId) return;

  if (type === 'leave_room') {
    handlePlayerDisconnect(roomCode, playerId, true);
    clientMeta.roomCode = undefined;
    return;
  }

  if (type === 'toggle_ready') {
    const p = room.players.find((pl) => pl.id === playerId);
    if (p) {
      p.isReady = !p.isReady;
      broadcast(room);
    }
    return;
  }

  if (type === 'select_game') {
    if (room.hostId !== playerId) return;
    room.selectedGame = msg.gameId as GameId;
    broadcast(room);
    return;
  }

  if (type === 'send_chat') {
    const p = room.players.find((pl) => pl.id === playerId);
    const text = String(msg.text || '').trim().slice(0, 200);
    if (!p || !text) return;
    room.chat.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      playerId: p.id,
      playerName: p.name,
      text,
      timestamp: Date.now(),
    });
    if (room.chat.length > 50) room.chat.shift();
    broadcast(room);
    return;
  }

  if (type === 'start_game' || type === 'play_again') {
    if (room.hostId !== playerId) return;
    initGameStateForRoom(room);
    broadcast(room);
    return;
  }

  if (type === 'return_to_lobby') {
    if (room.hostId !== playerId) return;
    room.status = 'lobby';
    room.gameState = {};
    broadcast(room);
    return;
  }

  if (type === 'game_action') {
    processRoomGameAction(room, playerId, msg.payload as Record<string, unknown>);
  }
}

function processRoomGameAction(room: InternalRoom, playerId: string, payload: Record<string, unknown>): void {
  const action = String(payload?.action || '');
  const game = room.selectedGame;

  // Generic live score sync for quiz/word/speed games
  if (action === 'score_update' || action === 'round_complete') {
    const p = room.players.find((pl) => pl.id === playerId);
    if (!p) return;
    const roundScore = Math.max(0, Number(payload.roundScore) || 0);
    const delta = Math.max(0, roundScore - p.roundScore);
    p.roundScore = roundScore;
    p.score += delta;

    if (action === 'round_complete') {
      const finished = new Set<string>((room.gameState.finishedIds as string[]) ?? []);
      finished.add(playerId);
      room.gameState.finishedIds = Array.from(finished);
      const connectedCount = room.players.filter((pl) => pl.isConnected).length;
      if (finished.size >= Math.max(1, connectedCount)) {
        room.status = 'results';
      }
    }
    broadcast(room);
    return;
  }

  // Collaborative party submission / vote / story append / reveal for social & creative games
  if (action === 'party_submit') {
    const submissions = (room.gameState.submissions as Record<string, unknown>) ?? {};
    submissions[playerId] = {
      playerId,
      playerName: room.players.find((pl) => pl.id === playerId)?.name ?? '',
      value: payload.value ?? '',
      at: Date.now(),
    };
    room.gameState.submissions = submissions;
    broadcast(room);
    return;
  }

  if (action === 'party_vote') {
    const votes = (room.gameState.votes as Record<string, string>) ?? {};
    votes[playerId] = String(payload.targetId ?? '');
    room.gameState.votes = votes;
    broadcast(room);
    return;
  }

  if (action === 'party_story_append') {
    const entries = (room.gameState.storyEntries as Array<{ playerId: string; playerName: string; text: string }>) ?? [];
    const text = String(payload.text ?? '').trim().slice(0, 220);
    if (text) {
      entries.push({
        playerId,
        playerName: room.players.find((pl) => pl.id === playerId)?.name ?? '',
        text,
      });
      room.gameState.storyEntries = entries.slice(-24);
      const p = room.players.find((pl) => pl.id === playerId);
      if (p) {
        p.roundScore += 20;
        p.score += 20;
      }
      broadcast(room);
    }
    return;
  }

  if (action === 'party_reveal') {
    room.gameState.revealed = true;
    broadcast(room);
    return;
  }

  // XO
  if (game === 'xo' && action === 'xo_move') {
    const index = Number(payload.index);
    const gs = room.gameState as {
      board: XOCell[];
      turnPlayerId: string;
      xPlayerId: string;
      oPlayerId: string;
      winner: string | null;
      winLine: number[] | null;
    };
    if (gs.winner || gs.turnPlayerId !== playerId || gs.board[index] !== null) return;
    const mark: XOCell = playerId === gs.xPlayerId ? 'X' : 'O';
    gs.board[index] = mark;
    const check = checkXOWinner(gs.board);
    if (check.winner) {
      gs.winner = check.winner;
      gs.winLine = check.line;
      if (check.winner === 'X' || check.winner === 'O') {
        const winId = check.winner === 'X' ? gs.xPlayerId : gs.oPlayerId;
        const wp = room.players.find((pl) => pl.id === winId);
        if (wp) {
          wp.roundScore += 100;
          wp.score += 100;
        }
      } else {
        room.players.forEach((pl) => {
          pl.roundScore += 30;
          pl.score += 30;
        });
      }
      room.status = 'results';
    } else {
      gs.turnPlayerId = playerId === gs.xPlayerId ? gs.oPlayerId : gs.xPlayerId;
    }
    broadcast(room);
    return;
  }

  // Rock Paper Scissors
  if (game === 'rps' && action === 'rps_pick') {
    const choice = payload.choice as RPSChoice;
    if (!['rock', 'paper', 'scissors'].includes(choice)) return;
    const choices = room.secrets.rpsChoices ?? {};
    choices[playerId] = choice;
    room.secrets.rpsChoices = choices;
    const submitted = new Set<string>((room.gameState.submittedIds as string[]) ?? []);
    submitted.add(playerId);
    room.gameState.submittedIds = Array.from(submitted);

    const activePlayers = room.players.slice(0, 2);
    if (activePlayers.length >= 2 && choices[activePlayers[0].id] && choices[activePlayers[1].id]) {
      const p1 = activePlayers[0];
      const p2 = activePlayers[1];
      const c1 = choices[p1.id];
      const c2 = choices[p2.id];
      const outcome = resolveRPS(c1, c2);
      if (outcome === 'p1') {
        p1.roundScore += 30;
        p1.score += 30;
      } else if (outcome === 'p2') {
        p2.roundScore += 30;
        p2.score += 30;
      } else {
        p1.roundScore += 10;
        p1.score += 10;
        p2.roundScore += 10;
        p2.score += 10;
      }
      const curRound = Number(room.gameState.round) || 1;
      const maxRounds = Number(room.gameState.maxRounds) || 5;
      room.gameState.lastReveal = {
        round: curRound,
        picks: { [p1.id]: c1, [p2.id]: c2 },
        winnerId: outcome === 'p1' ? p1.id : outcome === 'p2' ? p2.id : 'draw',
      };
      if (curRound >= maxRounds) {
        room.status = 'results';
      } else {
        room.gameState.round = curRound + 1;
        room.gameState.submittedIds = [];
        room.secrets.rpsChoices = {};
      }
    }
    broadcast(room);
    return;
  }

  // Number Guess
  if (game === 'number-guess' && action === 'number_guess') {
    const value = Math.round(Number(payload.value));
    if (!Number.isFinite(value) || value < 1 || value > 100) return;
    const target = room.secrets.numberTarget ?? 50;
    const fb = evaluateNumberGuess(value, target);
    const p = room.players.find((pl) => pl.id === playerId);
    const guesses = (room.gameState.guesses as Array<Record<string, unknown>>) ?? [];
    guesses.push({
      playerId,
      playerName: p?.name ?? '',
      value,
      relation: fb.relation,
      proximity: fb.proximity,
    });
    room.gameState.guesses = guesses;
    if (fb.relation === 'exact' && p) {
      const bonus = Math.max(40, 140 - guesses.length * 10);
      p.roundScore += bonus;
      p.score += bonus;
      room.gameState.winnerId = p.id;
      room.gameState.winnerName = p.name;
      room.gameState.targetRevealed = target;
      room.status = 'results';
    }
    broadcast(room);
    return;
  }

  // Draw & Guess / Sketch Relay
  if (game === 'draw-guess' || game === 'sketch-relay') {
    const drawerId = String(room.gameState.drawerId || '');
    if (action === 'draw_stroke' && playerId === drawerId) {
      const stroke = payload.stroke as DrawStroke;
      const strokes = (room.gameState.strokes as DrawStroke[]) ?? [];
      strokes.push(stroke);
      room.gameState.strokes = strokes;
      for (const [id, sock] of room.sockets.entries()) {
        if (id !== drawerId) {
          send(sock, { type: 'draw_stroke', stroke });
        }
      }
      return;
    }
    if (action === 'draw_clear' && playerId === drawerId) {
      room.gameState.strokes = [];
      broadcast(room);
      return;
    }
    if (action === 'draw_undo' && playerId === drawerId) {
      const strokes = (room.gameState.strokes as DrawStroke[]) ?? [];
      strokes.pop();
      room.gameState.strokes = strokes;
      broadcast(room);
      return;
    }
    if (action === 'draw_guess' && playerId !== drawerId) {
      const text = String(payload.text || '').trim().toLowerCase();
      const targetAr = (room.secrets.drawWord ?? '').trim().toLowerCase();
      const targetEn = (room.secrets.drawWordEn ?? '').trim().toLowerCase();
      const p = room.players.find((pl) => pl.id === playerId);
      if (!p || !text) return;

      const guessedIds = new Set<string>((room.gameState.guessedIds as string[]) ?? []);
      if (!guessedIds.has(playerId) && (text === targetAr || text === targetEn)) {
        guessedIds.add(playerId);
        room.gameState.guessedIds = Array.from(guessedIds);
        p.roundScore += 80;
        p.score += 80;
        const drawer = room.players.find((pl) => pl.id === drawerId);
        if (drawer) {
          drawer.roundScore += 40;
          drawer.score += 40;
        }
        addSystemChat(room, `${p.name} guessed the word!`);
        const nonDrawers = room.players.filter((pl) => pl.id !== drawerId && pl.isConnected);
        if (guessedIds.size >= Math.max(1, nonDrawers.length)) {
          room.gameState.revealedWord = `${room.secrets.drawWord} / ${room.secrets.drawWordEn}`;
          room.status = 'results';
        }
        broadcast(room);
      } else {
        room.chat.push({
          id: `${Date.now()}`,
          playerId: p.id,
          playerName: p.name,
          text: String(payload.text || ''),
          timestamp: Date.now(),
        });
        broadcast(room);
      }
      return;
    }
  }

  // Social Mafia
  if (game === 'mafia') {
    const roles = room.secrets.mafiaRoles ?? {};
    const myRole = roles[playerId];
    const playersState = (room.gameState.players as { id: string; name: string; alive: boolean }[]) ?? [];
    const me = playersState.find((pl) => pl.id === playerId);
    if (!me?.alive) return;

    if (action === 'mafia_night_action' && room.gameState.phase === 'night') {
      const targetId = String(payload.targetId || '');
      const actions = room.secrets.mafiaNightActions ?? {};
      if (myRole === 'mafia') actions.mafiaTarget = targetId;
      if (myRole === 'doctor') actions.doctorSave = targetId;
      if (myRole === 'detective') {
        actions.detectiveCheck = targetId;
        send(room.sockets.get(playerId), {
          type: 'private_data',
          game: 'mafia_inspect',
          targetId,
          isMafia: roles[targetId] === 'mafia',
        });
      }
      room.secrets.mafiaNightActions = actions;
      const acted = new Set<string>((room.gameState.nightActedIds as string[]) ?? []);
      acted.add(playerId);
      room.gameState.nightActedIds = Array.from(acted);

      const aliveSpecials = playersState.filter(
        (pl) => pl.alive && ['mafia', 'doctor', 'detective'].includes(roles[pl.id])
      );
      if (acted.size >= aliveSpecials.length) {
        // Resolve Dawn
        let eliminatedName: string | null = null;
        if (actions.mafiaTarget && actions.mafiaTarget !== actions.doctorSave) {
          const victim = playersState.find((pl) => pl.id === actions.mafiaTarget);
          if (victim) {
            victim.alive = false;
            eliminatedName = victim.name;
          }
        }
        room.gameState.lastDawnSummary = eliminatedName
          ? { eliminatedName }
          : { saved: true };
        const fullState: MafiaPlayerState[] = playersState.map((pl) => ({
          ...pl,
          role: roles[pl.id],
        }));
        const win = checkMafiaWin(fullState);
        if (win) {
          room.gameState.phase = 'ended';
          room.gameState.winnerSide = win;
          room.gameState.revealedRoles = roles;
          room.status = 'results';
          room.players.forEach((rp) => {
            const isMafia = roles[rp.id] === 'mafia';
            if ((win === 'mafia' && isMafia) || (win === 'citizens' && !isMafia)) {
              rp.roundScore += 100;
              rp.score += 100;
            }
          });
        } else {
          room.gameState.phase = 'day_vote';
          room.gameState.votes = {};
          room.secrets.mafiaVotes = {};
        }
      }
      broadcast(room);
      return;
    }

    if (action === 'mafia_vote' && room.gameState.phase === 'day_vote') {
      const targetId = String(payload.targetId || '');
      const votes = room.secrets.mafiaVotes ?? {};
      votes[playerId] = targetId;
      room.secrets.mafiaVotes = votes;
      room.gameState.votes = votes;

      const alivePlayers = playersState.filter((pl) => pl.alive);
      if (Object.keys(votes).length >= alivePlayers.length) {
        const tally: Record<string, number> = {};
        Object.values(votes).forEach((t) => {
          tally[t] = (tally[t] ?? 0) + 1;
        });
        let topId = '';
        let topCount = 0;
        for (const [id, count] of Object.entries(tally)) {
          if (count > topCount) {
            topCount = count;
            topId = id;
          }
        }
        if (topId && topId !== 'skip') {
          const exiled = playersState.find((pl) => pl.id === topId);
          if (exiled) exiled.alive = false;
        }
        const fullState: MafiaPlayerState[] = playersState.map((pl) => ({
          ...pl,
          role: roles[pl.id],
        }));
        const win = checkMafiaWin(fullState);
        if (win) {
          room.gameState.phase = 'ended';
          room.gameState.winnerSide = win;
          room.gameState.revealedRoles = roles;
          room.status = 'results';
          room.players.forEach((rp) => {
            const isMafia = roles[rp.id] === 'mafia';
            if ((win === 'mafia' && isMafia) || (win === 'citizens' && !isMafia)) {
              rp.roundScore += 100;
              rp.score += 100;
            }
          });
        } else {
          room.gameState.phase = 'night';
          room.gameState.dayNumber = Number(room.gameState.dayNumber || 1) + 1;
          room.gameState.nightActedIds = [];
          room.secrets.mafiaNightActions = {};
        }
      }
      broadcast(room);
    }
  }
}

export function handlePlayerDisconnect(roomCode?: string, playerId?: string, removeFully = false): void {
  if (!roomCode || !playerId) return;
  const room = rooms.get(roomCode);
  if (!room) return;

  room.sockets.delete(playerId);
  const p = room.players.find((pl) => pl.id === playerId);
  if (!p) return;

  if (removeFully) {
    room.players = room.players.filter((pl) => pl.id !== playerId);
    addSystemChat(room, `${p.name} left the room`);
  } else {
    p.isConnected = false;
  }

  // Migrate host if needed
  if (room.hostId === playerId && room.players.length > 0) {
    const nextHost = room.players.find((pl) => pl.isConnected) ?? room.players[0];
    room.players.forEach((pl) => {
      pl.isHost = pl.id === nextHost.id;
    });
    room.hostId = nextHost.id;
  }

  if (room.players.length === 0 || room.players.every((pl) => !pl.isConnected)) {
    // Keep empty rooms briefly for reconnect unless explicitly left
    if (removeFully && room.players.length === 0) {
      rooms.delete(roomCode);
      broadcastPresenceChange(playerId);
      return;
    }
  }

  broadcast(room);
  broadcastPresenceChange(playerId);
}
