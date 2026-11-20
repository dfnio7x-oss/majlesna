import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type {
  FriendRequestItem,
  GroupMessageItem,
  GroupRoomInvitePayload,
  PublicPlayerSummary,
  SocialGroup,
} from '../src/types/game.ts';
import {
  findPlayerIdByUsername,
  findRegisteredProfilesByQuery,
  getPublicSummaryById,
} from './profileStore.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SOCIAL_FILE = path.join(DATA_DIR, 'social.json');

interface StoredFriendship {
  id: string;
  a: string;
  b: string;
  createdAt: string;
}

interface StoredFriendRequest {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

interface StoredGroup {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  accentColor: string;
  createdAt: string;
  messages: GroupMessageItem[];
}

interface SocialStoreShape {
  friendships: StoredFriendship[];
  friendRequests: StoredFriendRequest[];
  groups: StoredGroup[];
}

let cache: SocialStoreShape | null = null;

function ensureStore(): SocialStoreShape {
  if (cache) return cache;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(SOCIAL_FILE)) {
      const raw = JSON.parse(fs.readFileSync(SOCIAL_FILE, 'utf-8')) as Partial<SocialStoreShape>;
      cache = {
        friendships: Array.isArray(raw.friendships) ? raw.friendships : [],
        friendRequests: Array.isArray(raw.friendRequests) ? raw.friendRequests : [],
        groups: Array.isArray(raw.groups) ? raw.groups : [],
      };
      return cache;
    }
  } catch {
    // fallback clean store
  }
  cache = { friendships: [], friendRequests: [], groups: [] };
  return cache;
}

function persistStore(): void {
  if (!cache) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SOCIAL_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch {
    // ignore read-only fs errors
  }
}

function pairMatch(f: StoredFriendship, id1: string, id2: string): boolean {
  return (f.a === id1 && f.b === id2) || (f.a === id2 && f.b === id1);
}

export function areFriends(playerIdA: string, playerIdB: string): boolean {
  const store = ensureStore();
  return store.friendships.some((f) => pairMatch(f, playerIdA, playerIdB));
}

export function getFriendIds(playerId: string): string[] {
  const store = ensureStore();
  const ids: string[] = [];
  for (const f of store.friendships) {
    if (f.a === playerId) ids.push(f.b);
    else if (f.b === playerId) ids.push(f.a);
  }
  return ids;
}

export function searchUsersForFriend(
  query: string,
  requesterId: string,
  isOnlineFn: (id: string) => boolean,
  getRoomFn: (id: string) => string | null
) {
  const store = ensureStore();
  const results = findRegisteredProfilesByQuery(query, requesterId, isOnlineFn, getRoomFn);
  const friendSet = new Set(getFriendIds(requesterId));

  return results.map((u) => {
    const outgoing = store.friendRequests.find(
      (r) => r.fromPlayerId === requesterId && r.toPlayerId === u.id && r.status === 'pending'
    );
    const incoming = store.friendRequests.find(
      (r) => r.fromPlayerId === u.id && r.toPlayerId === requesterId && r.status === 'pending'
    );
    return {
      user: u,
      relation: friendSet.has(u.id)
        ? ('friend' as const)
        : outgoing
        ? ('outgoing_pending' as const)
        : incoming
        ? ('incoming_pending' as const)
        : ('none' as const),
      requestId: outgoing?.id ?? incoming?.id,
    };
  });
}

export function getSocialOverview(
  playerId: string,
  isOnlineFn: (id: string) => boolean,
  getRoomFn: (id: string) => string | null
): {
  friends: PublicPlayerSummary[];
  incomingRequests: FriendRequestItem[];
  outgoingRequests: FriendRequestItem[];
  groups: SocialGroup[];
} {
  const store = ensureStore();
  const summarize = (id: string) =>
    getPublicSummaryById(id, isOnlineFn(id), getRoomFn(id));

  const friends: PublicPlayerSummary[] = [];
  for (const fid of getFriendIds(playerId)) {
    const summary = summarize(fid);
    if (summary) friends.push(summary);
  }
  friends.sort((a, b) => Number(Boolean(b.online)) - Number(Boolean(a.online)) || a.username.localeCompare(b.username));

  const incomingRequests: FriendRequestItem[] = [];
  const outgoingRequests: FriendRequestItem[] = [];

  for (const req of store.friendRequests) {
    if (req.status !== 'pending') continue;
    if (req.toPlayerId === playerId) {
      const fromUser = summarize(req.fromPlayerId);
      if (fromUser) {
        incomingRequests.push({ ...req, fromUser });
      }
    } else if (req.fromPlayerId === playerId) {
      const toUser = summarize(req.toPlayerId);
      if (toUser) {
        outgoingRequests.push({ ...req, toUser });
      }
    }
  }

  const groups: SocialGroup[] = [];
  for (const g of store.groups) {
    if (!g.memberIds.includes(playerId)) continue;
    const members: PublicPlayerSummary[] = [];
    for (const mid of g.memberIds) {
      const m = summarize(mid);
      if (m) members.push(m);
    }
    groups.push({
      id: g.id,
      name: g.name,
      ownerId: g.ownerId,
      memberIds: g.memberIds,
      members,
      accentColor: g.accentColor,
      createdAt: g.createdAt,
      messages: g.messages.slice(-80),
    });
  }

  return { friends, incomingRequests, outgoingRequests, groups };
}

export function sendFriendRequest(
  fromPlayerId: string,
  targetUsernameOrId: string
): {
  ok: boolean;
  status: number;
  error?: string;
  autoAccepted?: boolean;
  request?: StoredFriendRequest;
  targetPlayerId?: string;
} {
  const fromProfile = getPublicSummaryById(fromPlayerId);
  if (!fromProfile) {
    return { ok: false, status: 400, error: 'complete_profile_first' };
  }

  let targetId = targetUsernameOrId.trim();
  if (!getPublicSummaryById(targetId)) {
    const resolved = findPlayerIdByUsername(targetUsernameOrId);
    if (!resolved) {
      return { ok: false, status: 404, error: 'user_not_found' };
    }
    targetId = resolved;
  }

  if (targetId === fromPlayerId) {
    return { ok: false, status: 400, error: 'cannot_add_self' };
  }

  const store = ensureStore();
  if (areFriends(fromPlayerId, targetId)) {
    return { ok: false, status: 409, error: 'already_friends' };
  }

  const existingOutgoing = store.friendRequests.find(
    (r) => r.fromPlayerId === fromPlayerId && r.toPlayerId === targetId && r.status === 'pending'
  );
  if (existingOutgoing) {
    return { ok: false, status: 409, error: 'already_requested' };
  }

  // If target already sent an incoming pending request to caller, auto-accept
  const reversePending = store.friendRequests.find(
    (r) => r.fromPlayerId === targetId && r.toPlayerId === fromPlayerId && r.status === 'pending'
  );
  if (reversePending) {
    reversePending.status = 'accepted';
    store.friendships.push({
      id: `fr_${crypto.randomBytes(6).toString('hex')}`,
      a: fromPlayerId,
      b: targetId,
      createdAt: new Date().toISOString(),
    });
    persistStore();
    return {
      ok: true,
      status: 200,
      autoAccepted: true,
      request: reversePending,
      targetPlayerId: targetId,
    };
  }

  const req: StoredFriendRequest = {
    id: `freq_${crypto.randomBytes(6).toString('hex')}`,
    fromPlayerId,
    toPlayerId: targetId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  store.friendRequests.unshift(req);
  persistStore();
  return { ok: true, status: 201, request: req, targetPlayerId: targetId };
}

export function respondFriendRequest(
  callerId: string,
  requestId: string,
  action: 'accept' | 'decline' | 'cancel'
): {
  ok: boolean;
  status: number;
  error?: string;
  notifyPlayerIds?: string[];
} {
  const store = ensureStore();
  const req = store.friendRequests.find((r) => r.id === requestId && r.status === 'pending');
  if (!req) {
    return { ok: false, status: 404, error: 'request_not_found' };
  }

  if (action === 'cancel') {
    if (req.fromPlayerId !== callerId) {
      return { ok: false, status: 403, error: 'forbidden' };
    }
    req.status = 'declined';
    persistStore();
    return { ok: true, status: 200, notifyPlayerIds: [req.toPlayerId] };
  }

  if (req.toPlayerId !== callerId) {
    return { ok: false, status: 403, error: 'forbidden' };
  }

  req.status = action === 'accept' ? 'accepted' : 'declined';
  if (action === 'accept' && !areFriends(req.fromPlayerId, req.toPlayerId)) {
    store.friendships.push({
      id: `fr_${crypto.randomBytes(6).toString('hex')}`,
      a: req.fromPlayerId,
      b: req.toPlayerId,
      createdAt: new Date().toISOString(),
    });
  }
  persistStore();
  return { ok: true, status: 200, notifyPlayerIds: [req.fromPlayerId, req.toPlayerId] };
}

export function removeFriend(callerId: string, friendId: string): { ok: boolean } {
  const store = ensureStore();
  store.friendships = store.friendships.filter((f) => !pairMatch(f, callerId, friendId));
  persistStore();
  return { ok: true };
}

const GROUP_COLORS = ['#C84B31', '#2D6A4F', '#2B4C7E', '#B45309', '#7C3AED', '#0F766E'];

export function createGroup(params: {
  ownerId: string;
  name: string;
  memberIds: string[];
}): {
  ok: boolean;
  status: number;
  error?: string;
  group?: StoredGroup;
} {
  const cleanName = params.name.trim().slice(0, 36);
  if (cleanName.length < 2) {
    return { ok: false, status: 400, error: 'group_name_too_short' };
  }

  const friendSet = new Set(getFriendIds(params.ownerId));
  const uniqueMembers = Array.from(
    new Set([
      params.ownerId,
      ...params.memberIds.filter((id) => friendSet.has(id) && getPublicSummaryById(id) !== null),
    ])
  ).slice(0, 24);

  const store = ensureStore();
  const group: StoredGroup = {
    id: `grp_${crypto.randomBytes(6).toString('hex')}`,
    name: cleanName,
    ownerId: params.ownerId,
    memberIds: uniqueMembers,
    accentColor: GROUP_COLORS[store.groups.length % GROUP_COLORS.length],
    createdAt: new Date().toISOString(),
    messages: [],
  };

  store.groups.unshift(group);
  persistStore();
  return { ok: true, status: 201, group };
}

export function addGroupMembers(
  requesterId: string,
  groupId: string,
  newMemberIds: string[]
): { ok: boolean; status: number; error?: string; group?: StoredGroup } {
  const store = ensureStore();
  const group = store.groups.find((g) => g.id === groupId);
  if (!group) return { ok: false, status: 404, error: 'group_not_found' };
  if (!group.memberIds.includes(requesterId)) {
    return { ok: false, status: 403, error: 'forbidden' };
  }

  const friendSet = new Set(getFriendIds(requesterId));
  const merged = new Set(group.memberIds);
  for (const id of newMemberIds) {
    if (friendSet.has(id) && getPublicSummaryById(id)) {
      merged.add(id);
    }
  }
  group.memberIds = Array.from(merged).slice(0, 24);
  persistStore();
  return { ok: true, status: 200, group };
}

export function leaveGroup(
  playerId: string,
  groupId: string
): { ok: boolean; status: number; notifyMemberIds: string[] } {
  const store = ensureStore();
  const idx = store.groups.findIndex((g) => g.id === groupId);
  if (idx === -1) return { ok: false, status: 404, notifyMemberIds: [] };

  const group = store.groups[idx];
  const prevMembers = [...group.memberIds];
  group.memberIds = group.memberIds.filter((id) => id !== playerId);

  if (group.memberIds.length === 0) {
    store.groups.splice(idx, 1);
  } else if (group.ownerId === playerId) {
    group.ownerId = group.memberIds[0];
  }
  persistStore();
  return { ok: true, status: 200, notifyMemberIds: prevMembers };
}

export function postGroupMessage(params: {
  senderId: string;
  groupId: string;
  type: 'text' | 'room_invite';
  text: string;
  roomInvite?: GroupRoomInvitePayload;
}): {
  ok: boolean;
  status: number;
  error?: string;
  message?: GroupMessageItem;
  memberIds?: string[];
  groupName?: string;
} {
  const store = ensureStore();
  const group = store.groups.find((g) => g.id === params.groupId);
  if (!group) return { ok: false, status: 404, error: 'group_not_found' };
  if (!group.memberIds.includes(params.senderId)) {
    return { ok: false, status: 403, error: 'forbidden' };
  }

  const sender = getPublicSummaryById(params.senderId);
  if (!sender) return { ok: false, status: 400, error: 'sender_not_found' };

  const cleanText = params.text.trim().slice(0, 400);
  if (params.type === 'text' && !cleanText) {
    return { ok: false, status: 400, error: 'empty_message' };
  }

  const msg: GroupMessageItem = {
    id: `gm_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    groupId: group.id,
    senderId: sender.id,
    senderUsername: sender.username,
    senderAvatarId: sender.avatarId,
    senderCustomAvatarUrl: sender.customAvatarUrl,
    senderAccentColor: sender.accentColor,
    type: params.type,
    text: cleanText,
    ...(params.roomInvite ? { roomInvite: params.roomInvite } : {}),
    createdAt: new Date().toISOString(),
  };

  group.messages.push(msg);
  if (group.messages.length > 120) {
    group.messages = group.messages.slice(-120);
  }
  persistStore();

  return {
    ok: true,
    status: 201,
    message: msg,
    memberIds: group.memberIds,
    groupName: group.name,
  };
}
