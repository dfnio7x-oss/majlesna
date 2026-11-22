import { useCallback, useEffect, useState } from 'react';
import type {
  FriendRequestItem,
  GameId,
  GroupRoomInvitePayload,
  PublicPlayerSummary,
  SocialGroup,
} from '../types/game';
import type { SocialWsEvent } from './useMultiplayerSocket';

export interface FriendSearchResultItem {
  user: PublicPlayerSummary;
  relation: 'friend' | 'outgoing_pending' | 'incoming_pending' | 'none';
  requestId?: string;
}

export function useSocial(params: {
  playerId: string;
  enabled: boolean;
  getAuthHeaders: () => Promise<Record<string, string>>;
  subscribeSocialEvents: (cb: (ev: SocialWsEvent) => void) => () => void;
  onIncomingRequest?: (fromUsername: string) => void;
  onRoomInvite?: (invite: GroupRoomInvitePayload, groupName?: string) => void;
}) {
  const { playerId, enabled, getAuthHeaders, subscribeSocialEvents, onIncomingRequest, onRoomInvite } =
    params;

  const [friends, setFriends] = useState<PublicPlayerSummary[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestItem[]>([]);
  const [groups, setGroups] = useState<SocialGroup[]>([]);
  const [livePresenceMap, setLivePresenceMap] = useState<
    Record<string, { online: boolean; activeRoomCode: string | null }>
  >({});
  const [loading, setLoading] = useState(false);

  const refreshSocial = useCallback(async () => {
    if (!enabled || !playerId) return;
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/social/overview?playerId=${encodeURIComponent(playerId)}`, {
        headers,
      });
      if (res.ok) {
        const data = (await res.json()) as {
          friends: PublicPlayerSummary[];
          incomingRequests: FriendRequestItem[];
          outgoingRequests: FriendRequestItem[];
          groups: SocialGroup[];
        };
        const nextFriends = data.friends ?? [];
        const nextIn = data.incomingRequests ?? [];
        const nextOut = data.outgoingRequests ?? [];
        const nextGroups = data.groups ?? [];

        setFriends(nextFriends);
        setIncomingRequests(nextIn);
        setOutgoingRequests(nextOut);
        setGroups(nextGroups);
        setLivePresenceMap((prev) => {
          const updated = { ...prev };
          for (const f of nextFriends) {
            updated[f.id] = { online: Boolean(f.online), activeRoomCode: f.activeRoomCode ?? null };
          }
          for (const r of nextIn) {
            if (r.fromUser) {
              updated[r.fromUser.id] = {
                online: Boolean(r.fromUser.online),
                activeRoomCode: r.fromUser.activeRoomCode ?? null,
              };
            }
          }
          for (const r of nextOut) {
            if (r.toUser) {
              updated[r.toUser.id] = {
                online: Boolean(r.toUser.online),
                activeRoomCode: r.toUser.activeRoomCode ?? null,
              };
            }
          }
          for (const g of nextGroups) {
            for (const m of g.members) {
              updated[m.id] = { online: Boolean(m.online), activeRoomCode: m.activeRoomCode ?? null };
            }
          }
          return updated;
        });
      }
    } catch {
      // ignore offline transient error
    } finally {
      setLoading(false);
    }
  }, [enabled, playerId, getAuthHeaders]);

  useEffect(() => {
    if (enabled) {
      void refreshSocial();
    } else {
      setFriends([]);
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setGroups([]);
      setLivePresenceMap({});
    }
  }, [enabled, refreshSocial]);

  // Listen for real-time WebSocket updates
  useEffect(() => {
    if (!enabled) return;
    return subscribeSocialEvents((ev) => {
      if (ev.type === 'social_update') {
        if (ev.event === 'friend_request_received' && ev.fromUsername && ev.targetPlayerId === playerId) {
          onIncomingRequest?.(ev.fromUsername);
        }
        void refreshSocial();
      } else if (ev.type === 'group_message') {
        setGroups((prev) =>
          prev.map((g) => {
            if (g.id !== ev.groupId) return g;
            if (g.messages.some((m) => m.id === ev.message.id)) return g;
            return { ...g, messages: [...g.messages, ev.message].slice(-80) };
          })
        );
      } else if (ev.type === 'group_room_invite') {
        onRoomInvite?.(ev.invite, ev.groupName);
      } else if (ev.type === 'presence_changed') {
        setLivePresenceMap((prev) => ({
          ...prev,
          [ev.playerId]: { online: ev.online, activeRoomCode: ev.activeRoomCode },
        }));
        setFriends((prev) =>
          prev.map((f) =>
            f.id === ev.playerId
              ? { ...f, online: ev.online, activeRoomCode: ev.activeRoomCode }
              : f
          )
        );
        setIncomingRequests((prev) =>
          prev.map((r) =>
            r.fromPlayerId === ev.playerId && r.fromUser
              ? {
                  ...r,
                  fromUser: {
                    ...r.fromUser,
                    online: ev.online,
                    activeRoomCode: ev.activeRoomCode,
                  },
                }
              : r
          )
        );
        setOutgoingRequests((prev) =>
          prev.map((r) =>
            r.toPlayerId === ev.playerId && r.toUser
              ? {
                  ...r,
                  toUser: {
                    ...r.toUser,
                    online: ev.online,
                    activeRoomCode: ev.activeRoomCode,
                  },
                }
              : r
          )
        );
        setGroups((prev) =>
          prev.map((g) => ({
            ...g,
            members: g.members.map((m) =>
              m.id === ev.playerId
                ? { ...m, online: ev.online, activeRoomCode: ev.activeRoomCode }
                : m
            ),
          }))
        );
      }
    });
  }, [enabled, playerId, subscribeSocialEvents, refreshSocial, onIncomingRequest, onRoomInvite]);

  const searchUsers = useCallback(
    async (query: string): Promise<FriendSearchResultItem[]> => {
      if (!query.trim()) return [];
      const headers = await getAuthHeaders();
      const res = await fetch(
        `/api/friends/search?q=${encodeURIComponent(query.trim())}&playerId=${encodeURIComponent(playerId)}`,
        { headers }
      );
      if (!res.ok) return [];
      const data = (await res.json()) as { results?: FriendSearchResultItem[] };
      return data.results ?? [];
    },
    [getAuthHeaders, playerId]
  );

  const sendFriendRequest = useCallback(
    async (targetUsername: string): Promise<{ ok: boolean; error?: string; autoAccepted?: boolean }> => {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers,
        body: JSON.stringify({ playerId, targetUsername }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; autoAccepted?: boolean };
      if (data.ok) {
        void refreshSocial();
      }
      return data;
    },
    [getAuthHeaders, playerId, refreshSocial]
  );

  const respondFriendRequest = useCallback(
    async (requestId: string, action: 'accept' | 'decline' | 'cancel'): Promise<boolean> => {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/friends/respond', {
        method: 'POST',
        headers,
        body: JSON.stringify({ playerId, requestId, action }),
      });
      if (res.ok) {
        void refreshSocial();
        return true;
      }
      return false;
    },
    [getAuthHeaders, playerId, refreshSocial]
  );

  const removeFriend = useCallback(
    async (friendId: string): Promise<boolean> => {
      const headers = await getAuthHeaders();
      const res = await fetch(
        `/api/friends/${encodeURIComponent(friendId)}?playerId=${encodeURIComponent(playerId)}`,
        { method: 'DELETE', headers }
      );
      if (res.ok) {
        void refreshSocial();
        return true;
      }
      return false;
    },
    [getAuthHeaders, playerId, refreshSocial]
  );

  const createGroup = useCallback(
    async (name: string, memberIds: string[]): Promise<{ ok: boolean; groupId?: string; error?: string }> => {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers,
        body: JSON.stringify({ playerId, name, memberIds }),
      });
      const data = (await res.json()) as { ok: boolean; group?: { id: string }; error?: string };
      if (data.ok) {
        await refreshSocial();
      }
      return { ok: data.ok, groupId: data.group?.id, error: data.error };
    },
    [getAuthHeaders, playerId, refreshSocial]
  );

  const addGroupMembers = useCallback(
    async (
      groupId: string,
      payload: string[] | { memberIds?: string[]; usernames?: string[] }
    ): Promise<{ ok: boolean; error?: string }> => {
      const headers = await getAuthHeaders();
      const bodyPayload = Array.isArray(payload)
        ? { playerId, memberIds: payload }
        : { playerId, ...payload };
      const res = await fetch(`/api/groups/${encodeURIComponent(groupId)}/members`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyPayload),
      });
      const data = (await res.json().catch(() => ({ ok: res.ok }))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.ok && data.ok !== false) {
        await refreshSocial();
        return { ok: true };
      }
      return { ok: false, error: data.error || 'user_not_found' };
    },
    [getAuthHeaders, playerId, refreshSocial]
  );

  const leaveGroup = useCallback(
    async (groupId: string): Promise<boolean> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/groups/${encodeURIComponent(groupId)}/leave`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ playerId }),
      });
      if (res.ok) {
        await refreshSocial();
        return true;
      }
      return false;
    },
    [getAuthHeaders, playerId, refreshSocial]
  );

  const sendGroupMessage = useCallback(
    async (groupId: string, text: string): Promise<boolean> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/groups/${encodeURIComponent(groupId)}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ playerId, text }),
      });
      return res.ok;
    },
    [getAuthHeaders, playerId]
  );

  const inviteGroupToRoom = useCallback(
    async (
      groupId: string,
      opts: { gameId: GameId; existingRoomCode?: string; roomName?: string }
    ): Promise<{ ok: boolean; roomCode?: string }> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/groups/${encodeURIComponent(groupId)}/invite-room`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ playerId, ...opts }),
      });
      const data = (await res.json()) as { ok: boolean; roomCode?: string };
      return { ok: data.ok, roomCode: data.roomCode };
    },
    [getAuthHeaders, playerId]
  );

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    groups,
    livePresenceMap,
    loading,
    refreshSocial,
    searchUsers,
    sendFriendRequest,
    respondFriendRequest,
    removeFriend,
    createGroup,
    addGroupMembers,
    leaveGroup,
    sendGroupMessage,
    inviteGroupToRoom,
  };
}
