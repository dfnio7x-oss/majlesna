import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Gamepad2,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Send,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import type {
  FriendRequestItem,
  GameId,
  Language,
  PlayerProfile,
  PublicPlayerSummary,
  RoomState,
  SocialGroup,
} from '../types/game';
import type { FriendSearchResultItem } from '../hooks/useSocial';
import { GAMES_CATALOG, getGameById } from '../data/gamesCatalog';
import { t } from '../i18n/translations';
import { AvatarSvg, GameIcon } from './icons/GameIcons';
import { soundEngine } from '../utils/soundEngine';

interface FriendsGroupsViewProps {
  lang: Language;
  profile: PlayerProfile;
  friends: PublicPlayerSummary[];
  incomingRequests: FriendRequestItem[];
  outgoingRequests: FriendRequestItem[];
  groups: SocialGroup[];
  livePresenceMap?: Record<string, { online: boolean; activeRoomCode: string | null }>;
  activeRoom: RoomState | null;
  onSearchUsers: (query: string) => Promise<FriendSearchResultItem[]>;
  onSendFriendRequest: (
    targetUsername: string
  ) => Promise<{ ok: boolean; error?: string; autoAccepted?: boolean }>;
  onRespondRequest: (requestId: string, action: 'accept' | 'decline' | 'cancel') => Promise<boolean>;
  onRemoveFriend: (friendId: string) => Promise<boolean>;
  onCreateGroup: (
    name: string,
    memberIds: string[]
  ) => Promise<{ ok: boolean; groupId?: string; error?: string }>;
  onAddGroupMembers: (groupId: string, memberIds: string[]) => Promise<boolean>;
  onLeaveGroup: (groupId: string) => Promise<boolean>;
  onSendGroupMessage: (groupId: string, text: string) => Promise<boolean>;
  onInviteGroupToRoom: (
    groupId: string,
    opts: { gameId: GameId; existingRoomCode?: string; roomName?: string }
  ) => Promise<{ ok: boolean; roomCode?: string }>;
  onJoinRoomCode: (code: string) => void;
  onNotify: (kind: 'join' | 'points' | 'info', text: string) => void;
}

export const FriendsGroupsView: React.FC<FriendsGroupsViewProps> = ({
  lang,
  profile,
  friends,
  incomingRequests,
  outgoingRequests,
  groups,
  livePresenceMap = {},
  activeRoom,
  onSearchUsers,
  onSendFriendRequest,
  onRespondRequest,
  onRemoveFriend,
  onCreateGroup,
  onAddGroupMembers,
  onLeaveGroup,
  onSendGroupMessage,
  onInviteGroupToRoom,
  onJoinRoomCode,
  onNotify,
}) => {
  const copy = t(lang);

  const resolveOnline = (userId: string | undefined, fallbackOnline?: boolean): boolean => {
    if (userId && livePresenceMap[userId]) {
      return livePresenceMap[userId].online;
    }
    return Boolean(fallbackOnline);
  };

  const resolveActiveRoom = (
    userId: string | undefined,
    fallbackRoom?: string | null
  ): string | null => {
    if (userId && livePresenceMap[userId]) {
      return livePresenceMap[userId].activeRoomCode;
    }
    return fallbackRoom ?? null;
  };

  const renderPresenceBesideName = (isOnline: boolean) => (
    <span
      data-online={isOnline ? 'true' : 'false'}
      className={`inline-flex items-center gap-1 text-[11px] font-semibold shrink-0 whitespace-nowrap ${
        isOnline
          ? 'text-[#2D6A4F] dark:text-[#52B788]'
          : 'text-[#8C8478] dark:text-[#9D9386]'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          isOnline ? 'bg-[#2D6A4F] dark:bg-[#52B788]' : 'bg-[#A8A095] dark:bg-[#6E675F]'
        }`}
      />
      <span>{isOnline ? copy.social.online : copy.social.offline}</span>
    </span>
  );

  // Friend search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendSearchResultItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  // Groups state
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const [showAddMembers, setShowAddMembers] = useState(false);
  const [addMemberIds, setAddMemberIds] = useState<string[]>([]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteGameId, setInviteGameId] = useState<GameId>('xo');
  const [invitingRoom, setInvitingRoom] = useState(false);

  const [groupChatInput, setGroupChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Select first group automatically when available
  useEffect(() => {
    if (groups.length === 0) {
      setSelectedGroupId(null);
      return;
    }
    if (!selectedGroupId || !groups.some((g) => g.id === selectedGroupId)) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId) ?? null,
    [groups, selectedGroupId]
  );

  // Scroll chat to bottom when messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeGroup?.messages.length]);

  const friendsNotInActiveGroup = useMemo(() => {
    if (!activeGroup) return [];
    const existing = new Set(activeGroup.memberIds);
    return friends.filter((f) => !existing.has(f.id));
  }, [friends, activeGroup]);

  const runSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = searchQuery.trim().replace(/^@+/, '');
    if (!trimmed) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    setSearching(true);
    try {
      const results = await onSearchUsers(trimmed);
      setSearchResults(results);
      setHasSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendReq = async (username: string) => {
    soundEngine.playSelect();
    const res = await onSendFriendRequest(username);
    if (res.ok) {
      onNotify(
        res.autoAccepted ? 'info' : 'join',
        res.autoAccepted ? copy.social.requestAcceptedToast : copy.social.requestSentToast
      );
      if (searchQuery.trim()) {
        const refreshed = await onSearchUsers(searchQuery.trim().replace(/^@+/, ''));
        setSearchResults(refreshed);
      }
    } else {
      const errMsg =
        res.error === 'already_friends'
          ? copy.social.alreadyFriends
          : res.error === 'already_requested'
            ? copy.social.alreadyRequested
            : copy.social.userNotFound;
      onNotify('points', errMsg);
    }
  };

  const handleRespond = async (requestId: string, action: 'accept' | 'decline' | 'cancel') => {
    soundEngine.playClick();
    const ok = await onRespondRequest(requestId, action);
    if (ok && action === 'accept') {
      onNotify('info', copy.social.requestAcceptedToast);
    }
    if (searchQuery.trim()) {
      const refreshed = await onSearchUsers(searchQuery.trim().replace(/^@+/, ''));
      setSearchResults(refreshed);
    }
  };

  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || creatingGroup) return;
    setCreatingGroup(true);
    soundEngine.playSelect();
    try {
      const res = await onCreateGroup(newGroupName.trim(), selectedFriendIds);
      if (res.ok && res.groupId) {
        setSelectedGroupId(res.groupId);
        setNewGroupName('');
        setSelectedFriendIds([]);
        setShowCreateGroup(false);
      }
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleAddMembersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || addMemberIds.length === 0) return;
    soundEngine.playClick();
    const ok = await onAddGroupMembers(activeGroup.id, addMemberIds);
    if (ok) {
      setAddMemberIds([]);
      setShowAddMembers(false);
    }
  };

  const handleSendGroupChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !groupChatInput.trim()) return;
    const text = groupChatInput.trim();
    setGroupChatInput('');
    soundEngine.playClick();
    await onSendGroupMessage(activeGroup.id, text);
  };

  const handleSendRoomInvite = async () => {
    if (!activeGroup || invitingRoom) return;
    setInvitingRoom(true);
    soundEngine.playSelect();
    try {
      const res = await onInviteGroupToRoom(activeGroup.id, {
        gameId: activeRoom ? activeRoom.selectedGame : inviteGameId,
        existingRoomCode: activeRoom?.code,
        roomName: activeGroup.name,
      });
      setShowInviteModal(false);
      if (res.ok && res.roomCode) {
        onJoinRoomCode(res.roomCode);
      }
    } finally {
      setInvitingRoom(false);
    }
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
          {copy.social.title}
        </h1>
        <p className="text-sm text-[#57534E] dark:text-[#B8AFA3] mt-1">{copy.social.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Search, Requests, Friends List */}
        <div className="lg:col-span-5 space-y-5">
          {/* @username Friend Search */}
          <section className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-5 space-y-4">
            <h2 className="font-display text-base font-bold text-[#1C1917] dark:text-[#F5F2EB] flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#C84B31]" />
              <span>{copy.social.sendRequest}</span>
            </h2>

            <form onSubmit={runSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C8478] absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={copy.social.searchPlaceholder}
                  aria-label={copy.social.searchPlaceholder}
                  className="w-full h-10 ps-9 pe-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] placeholder:text-[#8C8478] focus:outline-none focus:border-[#C84B31]"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="h-10 px-4 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold tactile-btn cursor-pointer whitespace-nowrap"
              >
                {copy.social.searchBtn}
              </button>
            </form>

            {hasSearched && (
              <div className="space-y-2 pt-1">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-[#8C8478] py-2">{copy.social.noSearchResults}</p>
                ) : (
                  searchResults.map((item) => {
                    const isOnline = resolveOnline(item.user.id, item.user.online);
                    return (
                      <div
                        key={item.user.id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <AvatarSvg
                            avatarId={item.user.avatarId}
                            customAvatarUrl={item.user.customAvatarUrl}
                            accentColor={item.user.accentColor}
                            size={34}
                          />
                          <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <p dir="ltr" className="text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                              @{item.user.username}
                            </p>
                            {renderPresenceBesideName(isOnline)}
                          </div>
                        </div>

                      {item.relation === 'friend' && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#2D6A4F]/12 text-[#2D6A4F] dark:text-[#52B788] text-xs font-semibold flex items-center gap-1 shrink-0">
                          <UserCheck className="w-3.5 h-3.5" />
                          {copy.social.alreadyFriend}
                        </span>
                      )}

                      {item.relation === 'outgoing_pending' && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#D97706]/12 text-[#D97706] dark:text-[#FBBF24] text-xs font-semibold shrink-0">
                          {copy.social.requestSent}
                        </span>
                      )}

                      {item.relation === 'incoming_pending' && item.requestId && (
                        <button
                          type="button"
                          onClick={() => handleRespond(item.requestId!, 'accept')}
                          className="h-8 px-3 rounded-lg bg-[#2D6A4F] hover:bg-[#24553F] text-white text-xs font-semibold cursor-pointer shrink-0"
                        >
                          {copy.social.accept}
                        </button>
                      )}

                      {item.relation === 'none' && (
                        <button
                          type="button"
                          onClick={() => handleSendFriendReq(item.user.username)}
                          className="h-8 px-3 rounded-lg bg-[#C84B31] hover:bg-[#B03E26] text-white text-xs font-semibold tactile-btn cursor-pointer shrink-0"
                        >
                          {copy.social.sendRequest}
                        </button>
                      )}
                    </div>
                    );
                  })
                )}
              </div>
            )}
          </section>

          {/* Incoming Friend Requests */}
          {incomingRequests.length > 0 && (
            <section className="bg-white dark:bg-[#1E1B18] border border-[#C84B31]/40 rounded-2xl p-5 space-y-3">
              <h2 className="font-display text-base font-bold text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-between">
                <span>{copy.social.incomingTitle}</span>
                <span className="px-2 py-0.5 rounded-md bg-[#C84B31] text-white text-xs font-mono-tabular">
                  {incomingRequests.length}
                </span>
              </h2>
              <div className="space-y-2.5">
                {incomingRequests.map((req) => {
                  const isOnline = resolveOnline(req.fromUser?.id ?? req.fromPlayerId, req.fromUser?.online);
                  return (
                    <div
                      key={req.id}
                      className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AvatarSvg
                          avatarId={req.fromUser?.avatarId ?? 0}
                          customAvatarUrl={req.fromUser?.customAvatarUrl}
                          accentColor={req.fromUser?.accentColor ?? '#C84B31'}
                          size={36}
                        />
                        <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span dir="ltr" className="text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                            @{req.fromUser?.username ?? req.fromPlayerId}
                          </span>
                          {renderPresenceBesideName(isOnline)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRespond(req.id, 'accept')}
                          className="h-8 px-2.5 rounded-lg bg-[#2D6A4F] hover:bg-[#24553F] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{copy.social.accept}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRespond(req.id, 'decline')}
                          aria-label={copy.social.decline}
                          className="h-8 w-8 rounded-lg border border-[#E5DEC9] dark:border-[#342E28] bg-white dark:bg-[#1E1B18] text-[#57534E] hover:text-[#C84B31] flex items-center justify-center cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Outgoing Friend Requests */}
          {outgoingRequests.length > 0 && (
            <section className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-5 space-y-3">
              <h2 className="font-display text-sm font-bold text-[#57534E] dark:text-[#B8AFA3]">
                {copy.social.outgoingTitle} ({outgoingRequests.length})
              </h2>
              <div className="space-y-2">
                {outgoingRequests.map((req) => {
                  const isOnline = resolveOnline(req.toUser?.id ?? req.toPlayerId, req.toUser?.online);
                  return (
                    <div
                      key={req.id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <AvatarSvg
                          avatarId={req.toUser?.avatarId ?? 0}
                          customAvatarUrl={req.toUser?.customAvatarUrl}
                          accentColor={req.toUser?.accentColor ?? '#C84B31'}
                          size={30}
                        />
                        <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span dir="ltr" className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                            @{req.toUser?.username ?? req.toPlayerId}
                          </span>
                          {renderPresenceBesideName(isOnline)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRespond(req.id, 'cancel')}
                        className="text-xs font-semibold text-[#8C8478] hover:text-[#C84B31] px-2 py-1 cursor-pointer shrink-0"
                      >
                        {copy.social.cancelReq}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Friends List */}
          <section className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-5 space-y-4">
            <h2 className="font-display text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB]">
              {copy.social.friendsTitle} ({friends.length})
            </h2>

            {friends.length === 0 ? (
              <p className="text-xs text-[#57534E] dark:text-[#B8AFA3] py-4 leading-relaxed">
                {copy.social.noFriends}
              </p>
            ) : (
              <div className="space-y-2.5">
                {friends.map((friend) => {
                  const isOnline = resolveOnline(friend.id, friend.online);
                  const roomCode = resolveActiveRoom(friend.id, friend.activeRoomCode);
                  return (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <AvatarSvg
                            avatarId={friend.avatarId}
                            customAvatarUrl={friend.customAvatarUrl}
                            accentColor={friend.accentColor}
                            size={38}
                          />
                          <span
                            className={`absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full border-2 border-[#FAF8F4] dark:border-[#25211D] ${
                              isOnline ? 'bg-[#2D6A4F]' : 'bg-[#8C8478]'
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <p dir="ltr" className="text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                              @{friend.username}
                            </p>
                            {renderPresenceBesideName(isOnline)}
                          </div>
                          {roomCode && (
                            <p className="text-[11px] font-semibold text-[#2B4C7E] dark:text-[#60A5FA] mt-0.5">
                              {copy.social.inRoom}: {roomCode}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {roomCode && (
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playSelect();
                              onJoinRoomCode(roomCode);
                            }}
                            className="h-8 px-2.5 rounded-lg bg-[#2B4C7E] hover:bg-[#1E3A63] text-white text-xs font-semibold cursor-pointer"
                          >
                            {copy.social.joinFriendRoom}
                          </button>
                        )}
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          void onRemoveFriend(friend.id);
                        }}
                        aria-label={copy.social.removeFriend}
                        title={copy.social.removeFriend}
                        className="h-8 w-8 rounded-lg border border-[#E5DEC9] dark:border-[#342E28] bg-white dark:bg-[#1E1B18] text-[#8C8478] hover:text-[#C84B31] flex items-center justify-center cursor-pointer"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Groups & Live Group Chat + Room Invite */}
        <div className="lg:col-span-7 space-y-5">
          {/* Groups Bar + Create Group Panel */}
          <section className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#C84B31]" />
                <span>{copy.social.groupsTitle} ({groups.length})</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShowCreateGroup((v) => !v);
                }}
                className="h-9 px-3.5 rounded-xl bg-[#C84B31] hover:bg-[#B03E26] text-white text-xs font-semibold flex items-center gap-1.5 tactile-btn cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{copy.social.createGroupBtn}</span>
              </button>
            </div>

            {showCreateGroup && (
              <form
                onSubmit={handleCreateGroupSubmit}
                className="p-4 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] space-y-3"
              >
                <div>
                  <label htmlFor="new-group-name" className="block text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] mb-1">
                    {copy.social.groupNameLabel}
                  </label>
                  <input
                    id="new-group-name"
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder={copy.social.groupNamePlaceholder}
                    maxLength={40}
                    required
                    className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] mb-2">
                    {copy.social.pickFriendsLabel}
                  </p>
                  {friends.length === 0 ? (
                    <p className="text-xs text-[#8C8478]">{copy.social.needFriendsForGroup}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {friends.map((friend) => {
                        const checked = selectedFriendIds.includes(friend.id);
                        return (
                          <button
                            key={friend.id}
                            type="button"
                            onClick={() =>
                              setSelectedFriendIds((prev) =>
                                checked ? prev.filter((id) => id !== friend.id) : [...prev, friend.id]
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                              checked
                                ? 'bg-[#C84B31]/12 border-[#C84B31] text-[#C84B31]'
                                : 'bg-white dark:bg-[#1E1B18] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
                            }`}
                          >
                            <span dir="ltr">@{friend.username}</span>
                            {checked && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCreateGroup(false)}
                    className="h-9 px-3 rounded-lg border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] cursor-pointer"
                  >
                    {copy.actions.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={creatingGroup || !newGroupName.trim()}
                    className="h-9 px-4 rounded-lg bg-[#2D6A4F] hover:bg-[#24553F] disabled:opacity-45 text-white text-xs font-semibold cursor-pointer"
                  >
                    {copy.social.createGroupBtn}
                  </button>
                </div>
              </form>
            )}

            {/* Groups Selector Strip */}
            {groups.length === 0 ? (
              <p className="text-xs text-[#57534E] dark:text-[#B8AFA3] py-2">{copy.social.noGroups}</p>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {groups.map((grp) => {
                  const selected = grp.id === activeGroup?.id;
                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedGroupId(grp.id);
                        setShowInviteModal(false);
                        setShowAddMembers(false);
                      }}
                      className={`px-3.5 py-2 rounded-xl border text-start shrink-0 transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#C84B31]/10 border-[#C84B31] text-[#1C1917] dark:text-[#F5F2EB]'
                          : 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#57534E] dark:text-[#B8AFA3]'
                      }`}
                    >
                      <p className="text-xs font-bold">{grp.name}</p>
                      <p className="text-[11px] opacity-75 font-mono-tabular">
                        {grp.members.length} {copy.social.membersCount}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Active Group Chat & Room Invite Panel */}
          {activeGroup ? (
            <section className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-5 space-y-4">
              {/* Group Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1ECE2] dark:border-[#2E2822]">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                    {activeGroup.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {activeGroup.members.map((m) => {
                      const memberOnline = m.id === profile.id ? true : resolveOnline(m.id, m.online);
                      return (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-[11px] font-medium text-[#1C1917] dark:text-[#F5F2EB]"
                        >
                          <AvatarSvg
                            avatarId={m.avatarId}
                            customAvatarUrl={m.customAvatarUrl}
                            accentColor={m.accentColor}
                            size={16}
                          />
                          <span dir="ltr">@{m.username}</span>
                          {renderPresenceBesideName(memberOnline)}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playSelect();
                      setShowInviteModal((v) => !v);
                    }}
                    className="h-9 px-3.5 rounded-xl bg-[#2B4C7E] hover:bg-[#1E3A63] text-white text-xs font-semibold flex items-center gap-1.5 tactile-btn cursor-pointer"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>{copy.social.inviteGroupRoomBtn}</span>
                  </button>

                  {friendsNotInActiveGroup.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddMembers((v) => !v)}
                      className="h-9 px-3 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{copy.social.addMembersBtn}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      void onLeaveGroup(activeGroup.id);
                    }}
                    aria-label={copy.social.leaveGroupBtn}
                    title={copy.social.leaveGroupBtn}
                    className="h-9 w-9 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] text-[#8C8478] hover:text-[#C84B31] flex items-center justify-center cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add Members Drawer */}
              {showAddMembers && friendsNotInActiveGroup.length > 0 && (
                <form
                  onSubmit={handleAddMembersSubmit}
                  className="p-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] space-y-2.5"
                >
                  <p className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
                    {copy.social.pickFriendsLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {friendsNotInActiveGroup.map((friend) => {
                      const checked = addMemberIds.includes(friend.id);
                      return (
                        <button
                          key={friend.id}
                          type="button"
                          onClick={() =>
                            setAddMemberIds((prev) =>
                              checked ? prev.filter((id) => id !== friend.id) : [...prev, friend.id]
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                            checked
                              ? 'bg-[#C84B31]/12 border-[#C84B31] text-[#C84B31]'
                              : 'bg-white dark:bg-[#1E1B18] border-[#E5DEC9] dark:border-[#342E28]'
                          }`}
                        >
                          @{friend.username}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMembers(false)}
                      className="text-xs font-semibold text-[#8C8478] px-2 cursor-pointer"
                    >
                      {copy.actions.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={addMemberIds.length === 0}
                      className="h-8 px-3 rounded-lg bg-[#2D6A4F] text-white text-xs font-semibold disabled:opacity-45 cursor-pointer"
                    >
                      {copy.social.addMembersBtn}
                    </button>
                  </div>
                </form>
              )}

              {/* Invite Group to Game Room Modal/Drawer */}
              {showInviteModal && (
                <div className="p-4 rounded-xl bg-[#2B4C7E]/8 border border-[#2B4C7E]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                      {copy.social.inviteRoomModalTitle}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="text-[#8C8478] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {!activeRoom && (
                    <div>
                      <label htmlFor="group-invite-game" className="block text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] mb-1">
                        {copy.social.chooseGameLabel}
                      </label>
                      <select
                        id="group-invite-game"
                        value={inviteGameId}
                        onChange={(e) => setInviteGameId(e.target.value as GameId)}
                        className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB]"
                      >
                        {GAMES_CATALOG.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.title[lang]}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={invitingRoom}
                      onClick={handleSendRoomInvite}
                      className="h-9 px-4 rounded-xl bg-[#C84B31] hover:bg-[#B03E26] text-white text-xs font-semibold tactile-btn cursor-pointer"
                    >
                      {copy.social.sendInviteBtn}
                    </button>
                  </div>
                </div>
              )}

              {/* Live Group Chat Feed */}
              <div className="h-[340px] overflow-y-auto space-y-3 pe-1">
                {activeGroup.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[#8C8478] space-y-2">
                    <MessageSquare className="w-8 h-8 opacity-40" />
                    <p className="text-xs">{copy.social.chatPlaceholder}</p>
                  </div>
                ) : (
                  activeGroup.messages.map((msg) => {
                    const isMine = msg.senderId === profile.id;
                    if (msg.type === 'room_invite' && msg.roomInvite) {
                      const invite = msg.roomInvite;
                      const gameMeta = getGameById(invite.gameId);
                      return (
                        <div
                          key={msg.id}
                          className="p-3.5 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#2B4C7E]/35 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-[#2B4C7E] dark:text-[#60A5FA]">
                              {copy.social.roomInviteTitle} · @{msg.senderUsername}
                            </span>
                            <span className="font-mono-tabular text-xs font-bold text-[#C84B31]">
                              {invite.roomCode}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <GameIcon gameId={gameMeta.id} accent={gameMeta.accentColor} className="w-9 h-9 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                                  {gameMeta.title[lang]}
                                </p>
                                <p className="text-xs text-[#57534E] dark:text-[#B8AFA3] truncate">
                                  {invite.roomName}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playSelect();
                                onJoinRoomCode(invite.roomCode);
                              }}
                              className="h-9 px-3.5 rounded-xl bg-[#2D6A4F] hover:bg-[#24553F] text-white text-xs font-semibold shrink-0 tactile-btn cursor-pointer"
                            >
                              {copy.social.joinInviteBtn}
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm ${
                            isMine
                              ? 'bg-[#C84B31] text-white'
                              : 'bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
                          }`}
                        >
                          {!isMine && (
                            <p dir="ltr" className="text-[11px] font-bold text-[#C84B31] mb-0.5">
                              @{msg.senderUsername}
                            </p>
                          )}
                          <p className="leading-relaxed break-words">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Send Chat Message */}
              <form onSubmit={handleSendGroupChat} className="flex gap-2 pt-2 border-t border-[#F1ECE2] dark:border-[#2E2822]">
                <input
                  type="text"
                  value={groupChatInput}
                  onChange={(e) => setGroupChatInput(e.target.value)}
                  placeholder={copy.social.chatPlaceholder}
                  aria-label={copy.social.chatPlaceholder}
                  maxLength={300}
                  className="flex-1 h-10 px-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
                />
                <button
                  type="submit"
                  aria-label={copy.actions.send}
                  className="h-10 w-10 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] flex items-center justify-center tactile-btn cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </section>
          ) : (
            <section className="bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-10 text-center space-y-3">
              <MessageSquare className="w-10 h-10 mx-auto text-[#8C8478]/60" />
              <p className="text-sm text-[#57534E] dark:text-[#B8AFA3]">{copy.social.selectGroupPrompt}</p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
};
