import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, MessageSquarePlus, Send, ShieldAlert, Sparkles, Timer, UserCheck, Vote } from 'lucide-react';
import type { GameProps } from './GameShell';
import {
  LIAR_WORD_PAIRS,
  SECRET_VOTE_PROMPTS,
  SPY_LOCATIONS,
  TABOO_CARDS,
  TWO_TRUTHS_SOLO_BANK,
  WEIRD_TRANSLATOR_BANK,
  WHO_AM_I_CARDS,
  WOULD_YOU_RATHER_BANK,
} from '../../data/phase2Bank';
import { soundEngine } from '../../utils/soundEngine';

/* ============================================================================
 * 21. SECRET AGENT (Spyfall Location Deduction)
 * ============================================================================ */
export const GameSecretAgent: React.FC<GameProps> = ({
  lang,
  mode,
  playerId,
  room,
  secrets,
  onFinish,
  onRoomAction,
}) => {
  const gs = room?.gameState as {
    seed?: number;
    impostorId?: string;
    votes?: Record<string, string>;
    revealed?: boolean;
  } | undefined;

  const seed = gs?.seed ?? Math.floor(Math.random() * 100);
  const loc = SPY_LOCATIONS[seed % SPY_LOCATIONS.length];
  const isOnline = mode === 'online' && room;
  const isImpostor = isOnline ? Boolean(secrets.isImpostor) : false;

  // Local / Solo pass & play state
  const [localPlayers] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const [localSpyIdx] = useState(() => Math.floor(Math.random() * 4));
  const [localLoc] = useState(() => SPY_LOCATIONS[Math.floor(Math.random() * SPY_LOCATIONS.length)]);
  const [peekIdx, setPeekIdx] = useState<number | null>(null);
  const [soloVotedIdx, setSoloVotedIdx] = useState<number | null>(null);

  if (isOnline) {
    const votes = gs?.votes ?? {};
    const myVote = votes[playerId];
    return (
      <div className="max-w-xl mx-auto space-y-5 text-center">
        <div
          className={`p-5 rounded-2xl border-2 ${
            isImpostor
              ? 'bg-[#C84B31]/10 border-[#C84B31]'
              : 'bg-[#2D6A4F]/10 border-[#2D6A4F]'
          }`}
        >
          <p className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
            {lang === 'ar' ? 'بطاقتك السرية' : 'Your Secret Card'}
          </p>
          <h2 className="font-display text-2xl font-bold text-[#1C1917] dark:text-[#F5F2EB] mt-1">
            {isImpostor
              ? lang === 'ar'
                ? 'أنت العميل السري! استنتج الموقع دون أن تنكشف'
                : 'You are the Secret Agent! Blend in & guess the location'
              : `${lang === 'ar' ? 'الموقع:' : 'Location:'} ${loc[lang]}`}
          </h2>
        </div>

        <div className="space-y-2 text-start">
          <p className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
            {lang === 'ar' ? 'صوّت لكشف العميل السري:' : 'Vote to accuse the Secret Agent:'}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {room.players.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onRoomAction?.({ action: 'party_vote', targetId: p.id });
                }}
                className={`p-3 rounded-xl border text-sm font-semibold cursor-pointer ${
                  myVote === p.id
                    ? 'bg-[#C84B31] text-white border-[#C84B31]'
                    : 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
                }`}
              >
                {p.name} ({Object.values(votes).filter((v) => v === p.id).length})
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playPoint();
            onFinish({ outcome: 'win', score: 85, summaryText: `${loc[lang]}` });
          }}
          className="h-11 px-6 rounded-xl bg-[#2D6A4F] text-white text-sm font-semibold tactile-btn cursor-pointer"
        >
          {lang === 'ar' ? 'إنهاء وكشف الهوية' : 'Reveal & Finish Round'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5 text-center">
      <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">
        {lang === 'ar'
          ? 'مرّر الجهاز ليرى كل لاعب بطاقته سراً، ثم صوّتوا للعميل السري!'
          : 'Pass the device so each player peeks privately, then vote for the Secret Agent!'}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {localPlayers.map((pl, idx) => (
          <button
            key={pl}
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setPeekIdx(peekIdx === idx ? null : idx);
            }}
            className={`p-3 rounded-xl border text-xs font-bold cursor-pointer ${
              peekIdx === idx
                ? 'bg-[#C84B31] text-white border-[#C84B31]'
                : 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
            }`}
          >
            <Eye className="w-4 h-4 mx-auto mb-1" />
            {pl}
          </button>
        ))}
      </div>

      {peekIdx !== null && (
        <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
          <p className="font-display font-bold text-base text-[#1C1917] dark:text-[#F5F2EB]">
            {peekIdx === localSpyIdx
              ? lang === 'ar'
                ? 'أنت العميل السري!'
                : 'You are the Secret Agent!'
              : `${lang === 'ar' ? 'الموقع السري:' : 'Location:'} ${localLoc[lang]}`}
          </p>
          <button
            type="button"
            onClick={() => setPeekIdx(null)}
            className="mt-2 text-xs text-[#C84B31] font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'إخفاء البطاقة' : 'Hide Card'}</span>
          </button>
        </div>
      )}

      <div className="space-y-2 text-start">
        <p className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
          {lang === 'ar' ? 'اختر المشتبه به النهائي:' : 'Accuse the suspected Agent:'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {localPlayers.map((pl, idx) => (
            <button
              key={pl}
              type="button"
              onClick={() => {
                setSoloVotedIdx(idx);
                const caught = idx === localSpyIdx;
                if (caught) soundEngine.playPoint();
                else soundEngine.playError();
                onFinish({
                  outcome: caught ? 'win' : 'loss',
                  score: caught ? 95 : 25,
                  summaryText: lang === 'ar'
                    ? `العميل كان ${localPlayers[localSpyIdx]} (${localLoc.ar})`
                    : `Agent was ${localPlayers[localSpyIdx]} (${localLoc.en})`,
                });
              }}
              className={`h-10 rounded-xl border text-xs font-semibold cursor-pointer ${
                soloVotedIdx === idx
                  ? 'bg-[#2D6A4F] text-white'
                  : 'bg-white dark:bg-[#1E1B18] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
              }`}
            >
              {pl}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 22. WHO'S THE LIAR?
 * ============================================================================ */
export const GameWhosLiar: React.FC<GameProps> = ({
  lang,
  mode,
  playerId,
  room,
  secrets,
  onFinish,
  onRoomAction,
}) => {
  const gs = room?.gameState as {
    seed?: number;
    submissions?: Record<string, { playerName: string; value: string }>;
    votes?: Record<string, string>;
  } | undefined;
  const pairIdx = (gs?.seed ?? Math.floor(Math.random() * 50)) % LIAR_WORD_PAIRS.length;
  const pair = LIAR_WORD_PAIRS[pairIdx];
  const [clueInput, setClueInput] = useState('');

  // Solo / Local simulated clues
  const [soloRound] = useState(() => {
    const p = LIAR_WORD_PAIRS[Math.floor(Math.random() * LIAR_WORD_PAIRS.length)];
    const clues =
      p.main.en === 'Coffee'
        ? { ar: ['كوب ساخن صباحاً', 'محمص ومر المذاق', 'أوراق خضراء تغلى'], en: ['Morning roasted cup', 'Espresso aroma', 'Steeped green leaves'] }
        : p.main.en === 'Sun'
        ? { ar: ['حرارة قوية ظهراً', 'مركز المجموعة الشمسية', 'ينير السماء بالليل'], en: ['Blazing noon warmth', 'Star at center', 'Shines softly at midnight'] }
        : { ar: ['مرتبط بالموضوع بدقة', 'تلميح قريب جداً', 'تلميح مريب ومختلف'], en: ['Fits the main word', 'Clear genuine hint', 'Slightly suspicious decoy clue'] };
    return { p, clues, liarIdx: 2 };
  });

  if (mode === 'online' && room) {
    const myWord = secrets.isImpostor ? pair.decoy[lang] : pair.main[lang];
    const subs = Object.values(gs?.submissions ?? {});
    const votes = gs?.votes ?? {};
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-center">
          <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">
            {lang === 'ar' ? 'كلمتك السرية (قد تكون الكلمة المضللة!)' : 'Your Secret Word'}
          </p>
          <p className="font-display text-2xl font-bold text-[#C84B31] mt-1">{myWord}</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!clueInput.trim()) return;
            soundEngine.playClick();
            onRoomAction?.({ action: 'party_submit', value: clueInput.trim() });
            setClueInput('');
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={clueInput}
            onChange={(e) => setClueInput(e.target.value)}
            placeholder={lang === 'ar' ? 'اكتب وصفاً مختصراً دون كشف الكلمة...' : 'Write a 1-phrase clue...'}
            className="flex-1 h-11 px-3.5 rounded-xl bg-white dark:bg-[#141210] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB]"
          />
          <button
            type="submit"
            className="h-11 px-4 rounded-xl bg-[#C84B31] text-white text-xs font-semibold cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="space-y-2">
          {subs.map((s, i) => (
            <div key={i} className="p-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] flex justify-between text-xs">
              <strong className="text-[#1C1917] dark:text-[#F5F2EB]">{s.playerName}</strong>
              <span className="text-[#57534E] dark:text-[#B8AFA3]">{s.value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {room.players.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onRoomAction?.({ action: 'party_vote', targetId: p.id })}
              className={`h-10 rounded-xl border text-xs font-semibold cursor-pointer ${
                votes[playerId] === p.id
                  ? 'bg-[#C84B31] text-white'
                  : 'bg-white dark:bg-[#1E1B18] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
              }`}
            >
              {p.name} ({Object.values(votes).filter((v) => v === p.id).length})
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onFinish({ outcome: 'win', score: 80, summaryText: `${pair.main[lang]} vs ${pair.decoy[lang]}` })}
          className="w-full h-11 rounded-xl bg-[#2D6A4F] text-white text-sm font-semibold cursor-pointer"
        >
          {lang === 'ar' ? 'كشف الكذاب' : 'Reveal Liar'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5 text-center">
      <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">{lang === 'ar' ? 'الكلمة الرئيسية:' : 'Main Word:'}</p>
        <p className="font-display text-2xl font-bold text-[#C84B31]">{soloRound.p.main[lang]}</p>
      </div>
      <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">
        {lang === 'ar' ? 'من صاحب التلميح المريب؟' : 'Which speaker holds the decoy word?'}
      </p>
      <div className="space-y-2.5 text-start">
        {soloRound.clues[lang].map((clue, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              const win = idx === soloRound.liarIdx;
              if (win) soundEngine.playPoint();
              else soundEngine.playError();
              onFinish({
                outcome: win ? 'win' : 'loss',
                score: win ? 90 : 25,
                summaryText: `${lang === 'ar' ? 'الكلمة المضللة:' : 'Decoy:'} ${soloRound.p.decoy[lang]}`,
              });
            }}
            className="w-full p-4 rounded-xl bg-white dark:bg-[#25211D] hover:border-[#C84B31] border border-[#E5DEC9] dark:border-[#342E28] flex items-center justify-between text-sm text-[#1C1917] dark:text-[#F5F2EB] cursor-pointer"
          >
            <span className="font-bold">#{idx + 1}</span>
            <span>{clue}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 23. FORBIDDEN WORD (Taboo Card Challenge)
 * ============================================================================ */
export const GameForbiddenWord: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [turnsLeft, setTurnsLeft] = useState(5);
  const card = TABOO_CARDS[idx % TABOO_CARDS.length];

  const handleAction = (delta: number) => {
    const nextScore = Math.max(0, score + delta);
    if (delta > 0) soundEngine.playPoint();
    else soundEngine.playError();
    setScore(nextScore);
    onScoreProgress?.(nextScore);

    if (turnsLeft <= 1) {
      onFinish({
        outcome: nextScore >= 60 ? 'win' : 'draw',
        score: nextScore,
        summaryText: `${nextScore} pts`,
      });
    } else {
      setTurnsLeft((t) => t - 1);
      setIdx((i) => i + 1);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{lang === 'ar' ? `بطاقات متبقية: ${turnsLeft}` : `Cards left: ${turnsLeft}`}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="p-6 rounded-3xl bg-[#FAF8F4] dark:bg-[#25211D] border-2 border-[#E5DEC9] dark:border-[#342E28] space-y-4">
        <h2 className="font-display text-3xl font-extrabold text-[#C84B31]">{card.word[lang]}</h2>
        <div className="border-t border-[#E5DEC9] dark:border-[#342E28] pt-3 space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-red-600 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'كلمات ممنوعة' : 'Forbidden Words'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {card.forbidden[lang].map((fw) => (
              <div
                key={fw}
                className="py-1.5 px-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold"
              >
                {fw}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => handleAction(-10)}
          className="h-11 rounded-xl bg-red-600 text-white text-xs font-semibold cursor-pointer"
        >
          {lang === 'ar' ? 'خالفت (-10)' : 'Foul (-10)'}
        </button>
        <button
          type="button"
          onClick={() => handleAction(0)}
          className="h-11 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] cursor-pointer"
        >
          {lang === 'ar' ? 'تخطي' : 'Skip'}
        </button>
        <button
          type="button"
          onClick={() => handleAction(25)}
          className="h-11 rounded-xl bg-[#2D6A4F] text-white text-xs font-semibold cursor-pointer"
        >
          {lang === 'ar' ? 'خُمّنت (+25)' : 'Guessed (+25)'}
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
 * 24. WHO AM I? (Clue-by-Clue Character Guess)
 * ============================================================================ */
export const GameWhoAmI: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [idx, setIdx] = useState(0);
  const [cluesShown, setCluesShown] = useState(1);
  const [score, setScore] = useState(0);
  const card = WHO_AM_I_CARDS[idx];

  const handleGuess = (optIdx: number) => {
    const correct = optIdx === card.answerIndex;
    const bonus = correct ? Math.max(20, 45 - cluesShown * 10) : 0;
    const nextScore = score + bonus;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    if (idx + 1 >= WHO_AM_I_CARDS.length) {
      onFinish({
        outcome: nextScore >= 50 ? 'win' : 'draw',
        score: nextScore,
        summaryText: `${nextScore} pts`,
      });
    } else {
      setIdx((i) => i + 1);
      setCluesShown(1);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{idx + 1}/{WHO_AM_I_CARDS.length}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="p-5 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] space-y-2.5">
        {card.clues[lang].slice(0, cluesShown).map((cl, i) => (
          <p key={i} className="text-sm font-medium text-[#1C1917] dark:text-[#F5F2EB]">
            • {cl}
          </p>
        ))}
        {cluesShown < card.clues[lang].length && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setCluesShown((c) => c + 1);
            }}
            className="text-xs font-semibold text-[#C84B31] cursor-pointer"
          >
            {lang === 'ar' ? '+ كشف تلميح إضافي' : '+ Reveal next clue'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {card.options[lang].map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleGuess(i)}
            className="h-12 px-4 rounded-xl bg-white dark:bg-[#25211D] hover:bg-[#C84B31] hover:text-white border border-[#E5DEC9] dark:border-[#342E28] text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB] tactile-btn cursor-pointer"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 25. TWO TRUTHS AND A LIE
 * ============================================================================ */
export const GameTwoTruthsLie: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const card = TWO_TRUTHS_SOLO_BANK[idx];

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === card.lieIndex;
    const nextScore = correct ? score + 35 : score;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    window.setTimeout(() => {
      if (idx + 1 >= TWO_TRUTHS_SOLO_BANK.length) {
        onFinish({
          outcome: nextScore >= 70 ? 'win' : 'draw',
          score: nextScore,
          summaryText: `${nextScore} pts`,
        });
      } else {
        setIdx((v) => v + 1);
        setPicked(null);
      }
    }, 1100);
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{idx + 1}/{TWO_TRUTHS_SOLO_BANK.length}</span>
        <span>{lang === 'ar' ? 'اكتشف الجملة الكاذبة!' : 'Spot the single LIE!'}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="space-y-2.5">
        {card.statements[lang].map((st, i) => {
          let cls = 'bg-white dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]';
          if (picked !== null) {
            if (i === card.lieIndex) cls = 'bg-[#2D6A4F] text-white border-[#2D6A4F]';
            else if (i === picked) cls = 'bg-red-600 text-white border-red-600';
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              className={`w-full p-4 rounded-2xl border-2 text-start text-sm font-semibold tactile-btn cursor-pointer ${cls}`}
            >
              {st}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <p className="text-xs text-[#57534E] dark:text-[#B8AFA3] text-center">{card.explanation[lang]}</p>
      )}
    </div>
  );
};

/* ============================================================================
 * 26. GUESS AUTHOR (Who Wrote It?)
 * ============================================================================ */
export const GameGuessAuthor: React.FC<GameProps> = ({
  lang,
  mode,
  room,
  onFinish,
  onRoomAction,
}) => {
  const [answerText, setAnswerText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const soloPrompts = useMemo(
    () => [
      {
        prompt: { ar: 'أغرب عذر للتأخر عن الاجتماع؟', en: 'Weirdest excuse for being late to a meetup?' },
        entries: [
          { author: { ar: 'سارة', en: 'Sara' }, text: { ar: 'علقت في مصعد يحمل كعكة زفاف', en: 'Got stuck in an elevator with a wedding cake' } },
          { author: { ar: 'كريم', en: 'Karim' }, text: { ar: 'نسيت شحن حذائي الذكي', en: 'Forgot to charge my smart shoes' } },
          { author: { ar: 'ندى', en: 'Nada' }, text: { ar: 'تتبعت قطاً يشبه قطي عشر دقائق', en: 'Followed a lookalike cat for ten minutes' } },
        ],
        targetIdx: 1,
      },
    ],
    []
  );

  if (mode === 'online' && room) {
    const subs = Object.values((room.gameState.submissions as Record<string, { playerName: string; value: string }>) ?? {});
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-center">
          <p className="font-display font-bold text-base text-[#1C1917] dark:text-[#F5F2EB]">
            {lang === 'ar' ? 'اكتب إجابة سريعة وطريفة:' : 'Write a witty secret response:'}
          </p>
        </div>

        {!submitted ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!answerText.trim()) return;
              soundEngine.playClick();
              onRoomAction?.({ action: 'party_submit', value: answerText.trim() });
              setSubmitted(true);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="flex-1 h-11 px-3 rounded-xl bg-white dark:bg-[#141210] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB]"
            />
            <button type="submit" className="h-11 px-4 rounded-xl bg-[#C84B31] text-white text-xs font-semibold cursor-pointer">
              {lang === 'ar' ? 'إرسال' : 'Send'}
            </button>
          </form>
        ) : (
          <div className="space-y-2">
            {subs.map((s, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB]">
                “{s.value}”
              </div>
            ))}
            <button
              type="button"
              onClick={() => onFinish({ outcome: 'win', score: 85, summaryText: `${subs.length} responses` })}
              className="w-full h-11 rounded-xl bg-[#2D6A4F] text-white text-sm font-semibold cursor-pointer"
            >
              {lang === 'ar' ? 'كشف المؤلفين وإنهاء الجولة' : 'Reveal Authors & Finish'}
            </button>
          </div>
        )}
      </div>
    );
  }

  const sp = soloPrompts[0];
  const targetEntry = sp.entries[sp.targetIdx];

  return (
    <div className="max-w-lg mx-auto space-y-5 text-center">
      <div className="p-5 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        <p className="text-xs text-[#C84B31] font-semibold mb-1">{sp.prompt[lang]}</p>
        <p className="font-display text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB]">
          “{targetEntry.text[lang]}”
        </p>
      </div>
      <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">
        {lang === 'ar' ? 'اخمن من كتب هذه الإجابة:' : 'Guess who wrote this quote:'}
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {sp.entries.map((entry, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              const win = idx === sp.targetIdx;
              if (win) soundEngine.playPoint();
              else soundEngine.playError();
              onFinish({
                outcome: win ? 'win' : 'draw',
                score: win ? 85 : 30,
                summaryText: `${lang === 'ar' ? 'المؤلف:' : 'Author:'} ${targetEntry.author[lang]}`,
              });
            }}
            className="h-12 rounded-xl bg-white dark:bg-[#25211D] hover:bg-[#C84B31] hover:text-white border border-[#E5DEC9] dark:border-[#342E28] text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB] cursor-pointer"
          >
            {entry.author[lang]}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 27. WEIRD TRANSLATOR
 * ============================================================================ */
export const GameWeirdTranslator: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const q = WEIRD_TRANSLATOR_BANK[idx];

  const handlePick = (optIdx: number) => {
    const correct = optIdx === q.answerIndex;
    const nextScore = correct ? score + 35 : score;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    if (idx + 1 >= WEIRD_TRANSLATOR_BANK.length) {
      onFinish({
        outcome: nextScore >= 70 ? 'win' : 'draw',
        score: nextScore,
        summaryText: `${nextScore} pts`,
      });
    } else {
      setIdx((i) => i + 1);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{idx + 1}/{WEIRD_TRANSLATOR_BANK.length}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="p-6 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-center">
        <p className="font-display text-xl font-bold text-[#C84B31]">{q.weird[lang]}</p>
      </div>

      <div className="space-y-2.5">
        {q.options[lang].map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handlePick(i)}
            className="w-full p-3.5 rounded-xl bg-white dark:bg-[#25211D] hover:border-[#C84B31] border border-[#E5DEC9] dark:border-[#342E28] text-start text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB] cursor-pointer"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 28. FINISH THE STORY
 * ============================================================================ */
export const GameFinishStory: React.FC<GameProps> = ({
  lang,
  mode,
  playerName,
  room,
  onFinish,
  onRoomAction,
}) => {
  const starter =
    lang === 'ar'
      ? 'في منتصف الليل، اهتزت خريطة قديمة على الطاولة وظهر سهم متوهج يشير نحو...'
      : 'At midnight, an old parchment map vibrated on the parlor table and pointed toward...';
  const [localLines, setLocalLines] = useState<{ author: string; text: string }[]>([
    { author: lang === 'ar' ? 'الراوي' : 'Narrator', text: starter },
  ]);
  const [lineInput, setLineInput] = useState('');

  const onlineEntries =
    mode === 'online' && room
      ? ((room.gameState.storyEntries as { playerName: string; text: string }[]) ?? [])
      : null;

  const lines = onlineEntries
    ? [{ author: lang === 'ar' ? 'الراوي' : 'Narrator', text: starter }, ...onlineEntries.map((e) => ({ author: e.playerName, text: e.text }))]
    : localLines;

  const addLine = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = lineInput.trim();
    if (!clean) return;
    soundEngine.playPoint();
    setLineInput('');
    if (mode === 'online' && onRoomAction) {
      onRoomAction({ action: 'party_story_append', text: clean });
    } else {
      setLocalLines((prev) => [...prev, { author: playerName, text: clean }]);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] space-y-2.5 max-h-64 overflow-y-auto">
        {lines.map((item, idx) => (
          <div key={idx} className="text-sm leading-relaxed">
            <span className="font-bold text-[#C84B31] me-2">{item.author}:</span>
            <span className="text-[#1C1917] dark:text-[#F5F2EB]">{item.text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={addLine} className="flex gap-2">
        <input
          type="text"
          value={lineInput}
          onChange={(e) => setLineInput(e.target.value)}
          placeholder={lang === 'ar' ? 'أضف جملة جديدة لتكملة القصة...' : 'Add the next sentence to the story...'}
          className="flex-1 h-11 px-3.5 rounded-xl bg-white dark:bg-[#141210] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB]"
        />
        <button
          type="submit"
          className="h-11 px-4 rounded-xl bg-[#C84B31] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'أضف' : 'Append'}</span>
        </button>
      </form>

      <button
        type="button"
        disabled={lines.length < 2}
        onClick={() =>
          onFinish({
            outcome: 'win',
            score: Math.min(120, lines.length * 25),
            summaryText: lang === 'ar' ? `قصة جماعية من ${lines.length} فقرات!` : `Co-authored a ${lines.length}-part story!`,
          })
        }
        className="w-full h-11 rounded-xl bg-[#2D6A4F] disabled:opacity-40 text-white text-sm font-semibold cursor-pointer"
      >
        {lang === 'ar' ? 'نشر القصة وإنهاء الجولة' : 'Publish Story & Finish'}
      </button>
    </div>
  );
};

/* ============================================================================
 * 29. WOULD YOU RATHER?
 * ============================================================================ */
export const GameWouldYouRather: React.FC<GameProps> = ({
  lang,
  mode,
  room,
  onFinish,
  onRoomAction,
}) => {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<'a' | 'b' | null>(null);
  const [score, setScore] = useState(0);
  const q = WOULD_YOU_RATHER_BANK[idx];

  const choose = (side: 'a' | 'b') => {
    if (picked) return;
    setPicked(side);
    soundEngine.playPoint();
    if (mode === 'online' && room) {
      onRoomAction?.({ action: 'party_vote', targetId: side });
    }
    const nextScore = score + 25;
    setScore(nextScore);

    window.setTimeout(() => {
      if (idx + 1 >= WOULD_YOU_RATHER_BANK.length) {
        onFinish({
          outcome: 'win',
          score: nextScore,
          summaryText: `${nextScore} pts`,
        });
      } else {
        setIdx((i) => i + 1);
        setPicked(null);
      }
    }, 1150);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{idx + 1}/{WOULD_YOU_RATHER_BANK.length}</span>
        <span>{lang === 'ar' ? 'ماذا تفضل؟' : 'Would You Rather?'}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(['a', 'b'] as const).map((side) => {
          const pct = side === 'a' ? q.statsA : 100 - q.statsA;
          return (
            <button
              key={side}
              type="button"
              onClick={() => choose(side)}
              className={`p-6 rounded-2xl border-2 text-center space-y-2 tactile-btn cursor-pointer ${
                picked === side
                  ? 'bg-[#C84B31] text-white border-[#C84B31]'
                  : 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
              }`}
            >
              <p className="font-display text-base font-bold">{q[side][lang]}</p>
              {picked && <p className="font-mono-tabular text-xl font-extrabold">{pct}%</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * 30. SECRET VOTE
 * ============================================================================ */
export const GameSecretVote: React.FC<GameProps> = ({
  lang,
  mode,
  playerId,
  playerName,
  room,
  onFinish,
  onRoomAction,
}) => {
  const [promptIdx, setPromptIdx] = useState(0);
  const [votedTarget, setVotedTarget] = useState<string | null>(null);

  const candidates =
    mode === 'online' && room
      ? room.players.map((p) => ({ id: p.id, name: p.name }))
      : [
          { id: playerId, name: playerName },
          { id: 'c2', name: lang === 'ar' ? 'ليلى' : 'Layla' },
          { id: 'c3', name: lang === 'ar' ? 'عمر' : 'Omar' },
          { id: 'c4', name: lang === 'ar' ? 'سارة' : 'Sara' },
        ];

  const votes = (mode === 'online' && room ? (room.gameState.votes as Record<string, string>) : undefined) ?? {};
  const prompt = SECRET_VOTE_PROMPTS[promptIdx % SECRET_VOTE_PROMPTS.length];

  const castVote = (id: string) => {
    soundEngine.playPoint();
    setVotedTarget(id);
    if (mode === 'online' && onRoomAction) {
      onRoomAction({ action: 'party_vote', targetId: id });
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5 text-center">
      <div className="p-5 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        <Vote className="w-6 h-6 text-[#C84B31] mx-auto mb-2" />
        <h2 className="font-display text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
          {prompt[lang]}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {candidates.map((c) => {
          const count = Object.values(votes).filter((v) => v === c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => castVote(c.id)}
              className={`p-4 rounded-xl border-2 text-sm font-bold flex items-center justify-between cursor-pointer ${
                votedTarget === c.id
                  ? 'bg-[#C84B31] text-white border-[#C84B31]'
                  : 'bg-white dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
              }`}
            >
              <span>{c.name}</span>
              {mode === 'online' && <span className="font-mono-tabular">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setPromptIdx((i) => i + 1);
            setVotedTarget(null);
          }}
          className="flex-1 h-11 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] cursor-pointer"
        >
          {lang === 'ar' ? 'سؤال تصويت آخر' : 'Next Ballot Prompt'}
        </button>
        <button
          type="button"
          disabled={!votedTarget}
          onClick={() =>
            onFinish({
              outcome: 'win',
              score: 75,
              summaryText: lang === 'ar' ? 'اكتمل التصويت السري بنجاح!' : 'Secret vote tallied!',
            })
          }
          className="flex-1 h-11 rounded-xl bg-[#2D6A4F] disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
        >
          {lang === 'ar' ? 'اعتماد النتيجة' : 'Lock & Finish'}
        </button>
      </div>
    </div>
  );
};
