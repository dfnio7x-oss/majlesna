import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Moon, Shield, Sun, Vote } from 'lucide-react';
import type { GameProps } from './GameShell';
import { assignMafiaRoles, checkMafiaWin, type MafiaPlayerState, type MafiaRole } from '../../utils/gameRules';
import { soundEngine } from '../../utils/soundEngine';

const ROLE_LABELS: Record<MafiaRole, { ar: string; en: string; descAr: string; descEn: string }> = {
  mafia: {
    ar: 'المافيا',
    en: 'Mafia',
    descAr: 'اختر هدفاً كل ليلة وحاول إقناع الآخرين ببراءتك.',
    descEn: 'Eliminate one player each night and blend in by day.',
  },
  detective: {
    ar: 'المحقق',
    en: 'Detective',
    descAr: 'اكشف هوية لاعب واحد كل ليلة لتساعد المواطنين.',
    descEn: 'Inspect one player each night to uncover the Mafia.',
  },
  doctor: {
    ar: 'الطبيب',
    en: 'Doctor',
    descAr: 'احمِ لاعباً واحداً كل ليلة من هجوم المافيا.',
    descEn: 'Protect one player from elimination each night.',
  },
  citizen: {
    ar: 'مواطن',
    en: 'Citizen',
    descAr: 'راقب النقاشات وصوّت لاستبعاد المافيا في النهار.',
    descEn: 'Analyze clues and vote out the Mafia during the day.',
  },
};

export const GameMafia: React.FC<GameProps> = ({
  lang,
  mode,
  playerId,
  playerName,
  room,
  secrets,
  onFinish,
  onRoomAction,
}) => {
  // Solo/Local 5-player party simulation state
  const [localPlayers, setLocalPlayers] = useState<MafiaPlayerState[]>(() => {
    const names = lang === 'ar'
      ? [playerName, 'سارة', 'عمر', 'ليلى', 'طارق']
      : [playerName, 'Sara', 'Omar', 'Layla', 'Tariq'];
    const ids = ['me', 'b1', 'b2', 'b3', 'b4'];
    const roles = assignMafiaRoles(ids);
    return ids.map((id, i) => ({
      id,
      name: names[i],
      role: roles[id],
      alive: true,
      isBot: id !== 'me',
    }));
  });
  const [localPhase, setLocalPhase] = useState<'night' | 'day'>('night');
  const [dayCount, setDayCount] = useState(1);
  const [log, setLog] = useState<string[]>([]);
  const [roleVisible, setRoleVisible] = useState(false);

  const onlineState = mode === 'online' && room
    ? (room.gameState as {
        phase?: 'night' | 'day_vote' | 'ended';
        dayNumber?: number;
        players?: { id: string; name: string; alive: boolean }[];
        nightActedIds?: string[];
        votes?: Record<string, string>;
        lastDawnSummary?: { eliminatedName?: string; saved?: boolean } | null;
        winnerSide?: 'mafia' | 'citizens' | null;
      })
    : null;

  useEffect(() => {
    if (mode === 'online' && onlineState?.winnerSide) {
      const myRole = secrets.mafiaRole ?? 'citizen';
      const won =
        (onlineState.winnerSide === 'mafia' && myRole === 'mafia') ||
        (onlineState.winnerSide === 'citizens' && myRole !== 'mafia');
      onFinish({
        outcome: won ? 'win' : 'loss',
        score: won ? 110 : 30,
        summaryText:
          onlineState.winnerSide === 'mafia'
            ? lang === 'ar' ? 'حسمت المافيا الجولة!' : 'Mafia seized the town!'
            : lang === 'ar' ? 'انتصر المواطنون وكُشفت المافيا!' : 'Citizens uncovered the Mafia!',
      });
    }
  }, [onlineState?.winnerSide]);

  const myRole: MafiaRole = mode === 'online' ? secrets.mafiaRole ?? 'citizen' : localPlayers[0].role;
  const roleMeta = ROLE_LABELS[myRole];

  // Local Solo/Pass-and-Play Night Resolution
  const handleLocalNightAction = (targetId: string) => {
    soundEngine.playClick();
    const me = localPlayers[0];
    const aliveBots = localPlayers.filter((p) => p.alive && p.isBot);
    const mafiaBot = localPlayers.find((p) => p.alive && p.role === 'mafia');
    const doctorBot = localPlayers.find((p) => p.alive && p.role === 'doctor');

    let mafiaTarget = myRole === 'mafia' ? targetId : aliveBots[Math.floor(Math.random() * aliveBots.length)]?.id;
    if (myRole !== 'mafia' && mafiaBot) {
      const nonMafia = localPlayers.filter((p) => p.alive && p.role !== 'mafia');
      mafiaTarget = nonMafia[Math.floor(Math.random() * nonMafia.length)]?.id;
    }

    const doctorSave =
      myRole === 'doctor'
        ? targetId
        : doctorBot
        ? localPlayers.filter((p) => p.alive)[0]?.id
        : undefined;

    const newLog: string[] = [];
    if (myRole === 'detective') {
      const inspected = localPlayers.find((p) => p.id === targetId);
      newLog.push(
        lang === 'ar'
          ? `تحقيقك: ${inspected?.name} ${inspected?.role === 'mafia' ? 'من المافيا!' : 'بريء'}`
          : `Inspection: ${inspected?.name} is ${inspected?.role === 'mafia' ? 'MAFIA!' : 'Innocent'}`
      );
    }

    let updated = [...localPlayers];
    if (mafiaTarget && mafiaTarget !== doctorSave) {
      const victim = updated.find((p) => p.id === mafiaTarget);
      if (victim) {
        victim.alive = false;
        newLog.push(
          lang === 'ar'
            ? `في الفجر، تم إقصاء ${victim.name}`
            : `At dawn, ${victim.name} was eliminated.`
        );
      }
    } else {
      newLog.push(
        lang === 'ar' ? 'مرّت الليلة بسلام دون خسائر!' : 'Everyone survived the night safely!'
      );
    }

    setLocalPlayers(updated);
    setLog((prev) => [...newLog, ...prev]);

    const win = checkMafiaWin(updated);
    if (win) {
      const won = (win === 'mafia' && me.role === 'mafia') || (win === 'citizens' && me.role !== 'mafia');
      onFinish({
        outcome: won ? 'win' : 'loss',
        score: won ? 110 : 30,
        summaryText:
          win === 'mafia'
            ? lang === 'ar' ? 'فازت المافيا بالسيطرة على المجلس!' : 'Mafia won the town!'
            : lang === 'ar' ? 'انتصر المواطنون!' : 'Citizens won!',
      });
    } else {
      setLocalPhase('day');
    }
  };

  const handleLocalVote = (targetId: string) => {
    soundEngine.playSelect();
    const updated = localPlayers.map((p) => (p.id === targetId ? { ...p, alive: false } : p));
    const exiled = localPlayers.find((p) => p.id === targetId);
    setLocalPlayers(updated);
    setLog((prev) => [
      lang === 'ar' ? `تم التصويت لاستبعاد ${exiled?.name}` : `Town voted to exile ${exiled?.name}`,
      ...prev,
    ]);

    const win = checkMafiaWin(updated);
    if (win) {
      const me = updated[0];
      const won = (win === 'mafia' && me.role === 'mafia') || (win === 'citizens' && me.role !== 'mafia');
      onFinish({
        outcome: won ? 'win' : 'loss',
        score: won ? 120 : 35,
        summaryText:
          win === 'mafia'
            ? lang === 'ar' ? 'فازت المافيا!' : 'Mafia wins!'
            : lang === 'ar' ? 'اكتشف المواطنون المافيا!' : 'Citizens uncovered the Mafia!',
      });
    } else {
      setDayCount((d) => d + 1);
      setLocalPhase('night');
    }
  };

  const displayPlayers =
    mode === 'online'
      ? onlineState?.players ?? []
      : localPlayers.map((p) => ({ id: p.id, name: p.name, alive: p.alive }));

  const currentPhase =
    mode === 'online'
      ? onlineState?.phase === 'day_vote'
        ? 'day'
        : 'night'
      : localPhase;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Secret Role Privacy Card */}
      <div className="p-4 rounded-2xl bg-[#1C1917] text-[#FAF8F4] flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#A89F91]">{lang === 'ar' ? 'دورك السري' : 'Your Secret Role'}</p>
          <p className="font-display text-lg font-bold text-[#FBBF24]">
            {roleVisible ? roleMeta[lang] : '••••••••'}
          </p>
          {roleVisible && (
            <p className="text-xs text-[#D6CEBF] mt-0.5">
              {lang === 'ar' ? roleMeta.descAr : roleMeta.descEn}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setRoleVisible((v) => !v);
          }}
          className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white dark:hover:bg-[#2E2924]/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          {roleVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{roleVisible ? (lang === 'ar' ? 'إخفاء' : 'Hide') : (lang === 'ar' ? 'كشف' : 'Peek')}</span>
        </button>
      </div>

      {/* Phase Header */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        <div className="flex items-center gap-2 font-display font-bold text-sm text-[#1C1917] dark:text-[#F5F2EB]">
          {currentPhase === 'night' ? (
            <>
              <Moon className="w-4 h-4 text-[#2B4C7E]" />
              <span>{lang === 'ar' ? `مرحلة الليل — اليوم ${mode === 'online' ? onlineState?.dayNumber : dayCount}` : `Night Phase — Day ${mode === 'online' ? onlineState?.dayNumber : dayCount}`}</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-[#D97706]" />
              <span>{lang === 'ar' ? 'مرحلة التصويت النهاري' : 'Day Discussion & Vote'}</span>
            </>
          )}
        </div>
      </div>

      {/* Player Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayPlayers.map((pl) => {
          const isSelf = mode === 'online' ? pl.id === playerId : pl.id === 'me';
          const canAct =
            pl.alive &&
            (currentPhase === 'day' ? !isSelf : myRole !== 'citizen' || mode !== 'online');

          return (
            <div
              key={pl.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                pl.alive
                  ? 'bg-white dark:bg-[#1E1B18] border-[#E5DEC9] dark:border-[#342E28]'
                  : 'bg-[#F1ECE2] border-[#E5DEC9] dark:border-[#342E28] opacity-55'
              }`}
            >
              <div>
                <p className="font-semibold text-sm text-[#1C1917] dark:text-[#F5F2EB]">
                  {pl.name} {isSelf ? (lang === 'ar' ? '(أنت)' : '(You)') : ''}
                </p>
                <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">
                  {pl.alive ? (lang === 'ar' ? 'على قيد الحياة' : 'Alive') : (lang === 'ar' ? 'خارج الجولة' : 'Eliminated')}
                </p>
                {secrets.mafiaInspections[pl.id] !== undefined && (
                  <p className="text-xs font-bold text-[#991B1B]">
                    {secrets.mafiaInspections[pl.id]
                      ? lang === 'ar' ? 'مافيا!' : 'Mafia!'
                      : lang === 'ar' ? 'بريء' : 'Clean'}
                  </p>
                )}
              </div>

              {canAct && (
                <button
                  type="button"
                  onClick={() => {
                    if (mode === 'online' && onRoomAction) {
                      soundEngine.playClick();
                      onRoomAction({
                        action: currentPhase === 'night' ? 'mafia_night_action' : 'mafia_vote',
                        targetId: pl.id,
                      });
                    } else if (currentPhase === 'night') {
                      handleLocalNightAction(pl.id);
                    } else {
                      handleLocalVote(pl.id);
                    }
                  }}
                  className="h-8 px-3 rounded-lg bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {currentPhase === 'night' ? <Shield className="w-3.5 h-3.5" /> : <Vote className="w-3.5 h-3.5" />}
                  <span>
                    {currentPhase === 'night'
                      ? myRole === 'doctor'
                        ? lang === 'ar' ? 'حماية' : 'Save'
                        : myRole === 'detective'
                        ? lang === 'ar' ? 'فحص' : 'Inspect'
                        : lang === 'ar' ? 'اختيار' : 'Target'
                      : lang === 'ar' ? 'تصويت' : 'Vote'}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {log.length > 0 && (
        <div className="p-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] space-y-1 text-xs text-[#57534E] dark:text-[#B8AFA3]">
          {log.slice(0, 3).map((entry, idx) => (
            <p key={idx}>{entry}</p>
          ))}
        </div>
      )}
    </div>
  );
};
