import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bolt, Check, RotateCcw, Timer, X } from 'lucide-react';
import type { GameProps } from './GameShell';
import { QUIZ_QUESTIONS, TRUE_FALSE_BANK, SCRAMBLE_WORDS } from '../../data/questionBank';
import { TYPING_SENTENCES } from '../../data/phase2Bank';
import { scrambleChars } from '../../utils/gameRules';
import { soundEngine } from '../../utils/soundEngine';

/* ============================================================================
 * 11. FASTEST ANSWER (Buzzer Speed Trivia)
 * ============================================================================ */
export const GameFastestAnswer: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const questions = useMemo(() => [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5), []);
  const [idx, setIdx] = useState(0);
  const [msLeft, setMsLeft] = useState(7000);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const q = questions[idx];

  useEffect(() => {
    if (picked !== null) return;
    const interval = window.setInterval(() => {
      setMsLeft((m) => {
        if (m <= 100) {
          handleAnswer(-1);
          return 0;
        }
        return m - 100;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [idx, picked]);

  const handleAnswer = (optIdx: number) => {
    if (picked !== null) return;
    setPicked(optIdx);
    const correct = optIdx === q.correctIndex;
    const bonus = correct ? 15 + Math.round((msLeft / 7000) * 20) : 0;
    const nextScore = score + bonus;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    window.setTimeout(() => {
      if (idx + 1 >= questions.length) {
        onFinish({
          outcome: nextScore >= 80 ? 'win' : 'draw',
          score: nextScore,
          summaryText: `${nextScore} pts`,
        });
      } else {
        setIdx((i) => i + 1);
        setMsLeft(7000);
        setPicked(null);
      }
    }, 650);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{idx + 1}/{questions.length}</span>
        <span className="font-mono-tabular text-[#C84B31] flex items-center gap-1">
          <Bolt className="w-3.5 h-3.5" /> {(msLeft / 1000).toFixed(1)}s
        </span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="h-2 rounded-full bg-[#E5DEC9] dark:bg-[#342E28] overflow-hidden">
        <div
          className="h-full bg-[#C84B31] transition-all duration-100"
          style={{ width: `${(msLeft / 7000) * 100}%` }}
        />
      </div>

      <div className="p-6 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        <h2 className="font-display text-lg sm:text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
          {q.question[lang]}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options[lang].map((opt, i) => {
          let cls = 'bg-white dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]';
          if (picked !== null) {
            if (i === q.correctIndex) cls = 'bg-[#2D6A4F] text-white border-[#2D6A4F]';
            else if (i === picked) cls = 'bg-red-600 text-white border-red-600';
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleAnswer(i)}
              className={`p-4 rounded-2xl border-2 text-start text-sm font-semibold tactile-btn cursor-pointer ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * 12. PERFECT TIMING (Oscillating Gauge Meter)
 * ============================================================================ */
export const GamePerfectTiming: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [round, setRound] = useState(1);
  const [pos, setPos] = useState(0);
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const targetCenter = 50;
  const zoneHalfWidth = Math.max(6, 16 - round * 2);

  useEffect(() => {
    if (stoppedAt !== null) return;
    let frameId = 0;
    const start = performance.now();
    const speed = 0.0024 + round * 0.0007;
    const tick = (now: number) => {
      const val = ((Math.sin((now - start) * speed) + 1) / 2) * 100;
      setPos(val);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [round, stoppedAt]);

  const handleStop = () => {
    if (stoppedAt !== null) return;
    setStoppedAt(pos);
    const diff = Math.abs(pos - targetCenter);
    let pts = 0;
    if (diff <= zoneHalfWidth * 0.45) pts = 35;
    else if (diff <= zoneHalfWidth) pts = 20;
    else if (diff <= zoneHalfWidth * 1.8) pts = 8;

    if (pts >= 20) soundEngine.playPoint();
    else soundEngine.playError();

    const nextScore = score + pts;
    setScore(nextScore);
    onScoreProgress?.(nextScore);

    window.setTimeout(() => {
      if (round >= 4) {
        onFinish({
          outcome: nextScore >= 70 ? 'win' : 'draw',
          score: nextScore,
          summaryText: `${nextScore} pts`,
        });
      } else {
        setRound((r) => r + 1);
        setStoppedAt(null);
      }
    }, 850);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{lang === 'ar' ? `الجولة ${round}/4` : `Round ${round}/4`}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <p className="text-sm text-[#57534E] dark:text-[#B8AFA3]">
        {lang === 'ar'
          ? 'أوقف المؤشر تماماً داخل المنطقة الخضراء!'
          : 'Hit Stop right inside the green zone!'}
      </p>

      <div className="relative h-12 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] overflow-hidden" dir="ltr">
        <div
          className="absolute top-0 bottom-0 bg-[#2D6A4F]/25 dark:bg-[#52B788]/30 border-x-2 border-[#2D6A4F]"
          style={{
            left: `${targetCenter - zoneHalfWidth}%`,
            width: `${zoneHalfWidth * 2}%`,
          }}
        />
        <div
          className="absolute top-1 bottom-1 w-2.5 -ml-1.25 rounded-full bg-[#C84B31] shadow-md"
          style={{ left: `${stoppedAt ?? pos}%` }}
        />
      </div>

      <button
        type="button"
        onClick={handleStop}
        className="w-full max-w-xs h-14 rounded-2xl bg-[#C84B31] hover:bg-[#B03E26] text-white font-display text-lg font-bold tactile-btn cursor-pointer"
      >
        {lang === 'ar' ? 'توقف الآن!' : 'STOP NOW!'}
      </button>
    </div>
  );
};

/* ============================================================================
 * 13. REACTION DUEL (Solo or Same-Device 2P Split Duel)
 * ============================================================================ */
export const GameReactionDuel: React.FC<GameProps> = ({ lang, mode, onFinish }) => {
  const [phase, setPhase] = useState<'ready' | 'wait' | 'go'>('ready');
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [lastNote, setLastNote] = useState<string>('');
  const goAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const triggerNext = () => {
    setPhase('wait');
    setLastNote('');
    const delay = 1100 + Math.random() * 2000;
    timerRef.current = window.setTimeout(() => {
      goAtRef.current = performance.now();
      setPhase('go');
      soundEngine.playSelect();
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleTap = (who: 'p1' | 'p2') => {
    if (phase === 'ready') {
      triggerNext();
      return;
    }
    if (phase === 'wait') {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      soundEngine.playError();
      setLastNote(
        lang === 'ar'
          ? `${who === 'p1' ? 'اللاعب 1' : 'اللاعب 2'} ضغط مبكراً!`
          : `${who === 'p1' ? 'Player 1' : 'Player 2'} jumped early!`
      );
      setPhase('ready');
      return;
    }
    const ms = Math.round(performance.now() - goAtRef.current);
    soundEngine.playPoint();
    const nextScores = { ...scores };
    if (mode === 'local') {
      nextScores[who] += 1;
    } else {
      const pts = Math.max(15, Math.round(50 - ms / 14));
      nextScores.p1 += pts;
    }
    setScores(nextScores);
    setLastNote(`${ms} ms!`);

    if (round >= 3) {
      if (mode === 'local') {
        const win = nextScores.p1 > nextScores.p2 ? 'P1' : 'P2';
        onFinish({
          outcome: 'win',
          score: Math.max(nextScores.p1, nextScores.p2) * 35,
          summaryText: lang === 'ar' ? `الفائز: ${win} (${nextScores.p1}-${nextScores.p2})` : `Winner: ${win} (${nextScores.p1}-${nextScores.p2})`,
        });
      } else {
        onFinish({
          outcome: nextScores.p1 >= 70 ? 'win' : 'draw',
          score: nextScores.p1,
          summaryText: `${lang === 'ar' ? 'آخر استجابة:' : 'Last reflex:'} ${ms} ms`,
        });
      }
    } else {
      setRound((r) => r + 1);
      setPhase('ready');
    }
  };

  const bgCls =
    phase === 'go'
      ? 'bg-[#2D6A4F] text-white'
      : phase === 'wait'
      ? 'bg-[#C84B31] text-white'
      : 'bg-[#FAF8F4] dark:bg-[#25211D] text-[#1C1917] dark:text-[#F5F2EB]';

  return (
    <div className="max-w-lg mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{lang === 'ar' ? `الجولة ${round}/3` : `Round ${round}/3`}</span>
        {lastNote && <span className="font-mono-tabular text-[#C84B31]">{lastNote}</span>}
      </div>

      <div className={`p-8 rounded-3xl border border-[#E5DEC9] dark:border-[#342E28] transition-colors ${bgCls}`}>
        <p className="font-display text-2xl font-bold">
          {phase === 'ready'
            ? lang === 'ar'
              ? 'اضغط للبدء'
              : 'Tap to Start'
            : phase === 'wait'
            ? lang === 'ar'
              ? 'انتظر اللون الأخضر...'
              : 'Wait for Green...'
            : lang === 'ar'
            ? 'اضغط الآن!'
            : 'TAP NOW!'}
        </p>
      </div>

      {mode === 'local' ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTap('p1')}
            className="h-16 rounded-2xl bg-[#2B4C7E] text-white font-display font-bold tactile-btn cursor-pointer"
          >
            {lang === 'ar' ? `اللاعب 1 (${scores.p1})` : `Player 1 (${scores.p1})`}
          </button>
          <button
            type="button"
            onClick={() => handleTap('p2')}
            className="h-16 rounded-2xl bg-[#D97706] text-white font-display font-bold tactile-btn cursor-pointer"
          >
            {lang === 'ar' ? `اللاعب 2 (${scores.p2})` : `Player 2 (${scores.p2})`}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => handleTap('p1')}
          className="w-full h-16 rounded-2xl bg-[#1C1917] dark:bg-[#C84B31] text-white font-display font-bold text-lg tactile-btn cursor-pointer"
        >
          {phase === 'ready'
            ? lang === 'ar'
              ? 'ابدأ القياس'
              : 'Start Trial'
            : lang === 'ar'
            ? 'زر الاستجابة'
            : 'React Button'}
        </button>
      )}
    </div>
  );
};

/* ============================================================================
 * 14. TYPING RACE (WPM Speed Sprint)
 * ============================================================================ */
export const GameTypingRace: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const sentences = TYPING_SENTENCES[lang];
  const [target] = useState(() => sentences[Math.floor(Math.random() * sentences.length)]);
  const [typed, setTyped] = useState('');
  const startedAtRef = useRef<number | null>(null);
  const [wpm, setWpm] = useState(0);

  const handleChange = (val: string) => {
    if (!startedAtRef.current && val.length > 0) {
      startedAtRef.current = performance.now();
    }
    setTyped(val);

    if (startedAtRef.current) {
      const mins = Math.max(0.02, (performance.now() - startedAtRef.current) / 60000);
      const words = val.trim().split(/\s+/).filter(Boolean).length;
      setWpm(Math.round(words / mins));
    }

    if (val === target) {
      soundEngine.playPoint();
      const mins = Math.max(0.02, (performance.now() - (startedAtRef.current ?? performance.now())) / 60000);
      const finalWpm = Math.round(target.split(/\s+/).length / mins);
      const score = Math.min(130, 50 + finalWpm);
      onScoreProgress?.(score);
      onFinish({
        outcome: 'win',
        score,
        summaryText: `${finalWpm} WPM`,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{lang === 'ar' ? 'تقدم الكتابة' : 'Progress'}: {Math.round((typed.length / target.length) * 100)}%</span>
        <span className="font-mono-tabular text-[#C84B31]">{wpm} WPM</span>
      </div>

      <div className="p-5 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] font-display text-lg leading-relaxed select-none">
        {Array.from(target).map((ch, idx) => {
          const entered = typed[idx];
          let cls = 'text-[#57534E] dark:text-[#B8AFA3]';
          if (entered !== undefined) {
            cls = entered === ch ? 'text-[#2D6A4F] dark:text-[#52B788]' : 'text-red-600 underline';
          }
          return (
            <span key={idx} className={cls}>
              {ch}
            </span>
          );
        })}
      </div>

      <input
        type="text"
        value={typed}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={lang === 'ar' ? 'ابدأ الكتابة هنا بأقصى سرعة...' : 'Start typing here as fast as you can...'}
        autoFocus
        className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#141210] border-2 border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
      />
    </div>
  );
};

/* ============================================================================
 * 15. FOCUS CHALLENGE (Stroop Ink vs Meaning Test)
 * ============================================================================ */
const STROOP_ITEMS = [
  { key: 'red', hex: '#DC2626', label: { ar: 'أحمر', en: 'RED' } },
  { key: 'blue', hex: '#2563EB', label: { ar: 'أزرق', en: 'BLUE' } },
  { key: 'green', hex: '#16A34A', label: { ar: 'أخضر', en: 'GREEN' } },
  { key: 'amber', hex: '#D97706', label: { ar: 'أصفر', en: 'AMBER' } },
];

export const GameFocusChallenge: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [inkIdx, setInkIdx] = useState(2);

  const nextTrial = (curRound: number, curScore: number) => {
    if (curRound >= 10) {
      onFinish({
        outcome: curScore >= 70 ? 'win' : 'draw',
        score: curScore,
        summaryText: `${curScore} pts`,
      });
      return;
    }
    const w = Math.floor(Math.random() * 4);
    let ink = Math.floor(Math.random() * 4);
    if (ink === w) ink = (ink + 1) % 4;
    setWordIdx(w);
    setInkIdx(ink);
    setRound(curRound + 1);
  };

  const handlePick = (chosenInkIdx: number) => {
    const correct = chosenInkIdx === inkIdx;
    const nextScore = correct ? score + 12 : score;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    nextTrial(round, nextScore);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{round}/10</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <p className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        {lang === 'ar'
          ? 'اختر لون الحبر المكتوب به — تجاهل معنى الكلمة!'
          : 'Tap the INK COLOR — ignore what the word says!'}
      </p>

      <div className="py-10 rounded-3xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        <span
          className="font-display text-5xl font-extrabold"
          style={{ color: STROOP_ITEMS[inkIdx].hex }}
        >
          {STROOP_ITEMS[wordIdx].label[lang]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {STROOP_ITEMS.map((item, idx) => (
          <button
            key={item.key}
            type="button"
            onClick={() => handlePick(idx)}
            className="h-12 rounded-xl bg-white dark:bg-[#25211D] hover:bg-[#FAF8F4] border border-[#E5DEC9] dark:border-[#342E28] font-display font-bold text-sm text-[#1C1917] dark:text-[#F5F2EB] tactile-btn cursor-pointer"
          >
            {item.label[lang]}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 16. FAST COUNTING
 * ============================================================================ */
const COUNT_TOKENS = ['★', '●', '▲', '◆'];

function makeCountRound() {
  const targetIdx = Math.floor(Math.random() * COUNT_TOKENS.length);
  const grid = Array.from({ length: 24 }, () => COUNT_TOKENS[Math.floor(Math.random() * COUNT_TOKENS.length)]);
  const target = COUNT_TOKENS[targetIdx];
  const answer = grid.filter((x) => x === target).length;
  const opts = new Set([answer]);
  while (opts.size < 4) {
    const cand = Math.max(1, answer + Math.floor(Math.random() * 5) - 2);
    opts.add(cand);
  }
  return {
    target,
    grid,
    answer,
    options: Array.from(opts).sort((a, b) => a - b),
  };
}

export const GameFastCounting: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [round, setRound] = useState(1);
  const [data, setData] = useState(() => makeCountRound());
  const [score, setScore] = useState(0);

  const pickAnswer = (num: number) => {
    const correct = num === data.answer;
    const nextScore = correct ? score + 25 : score;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    if (round >= 4) {
      onFinish({
        outcome: nextScore >= 75 ? 'win' : 'draw',
        score: nextScore,
        summaryText: `${nextScore} pts`,
      });
    } else {
      setRound((r) => r + 1);
      setData(makeCountRound());
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{round}/4</span>
        <span>
          {lang === 'ar' ? 'كم عدد الرمز:' : 'Count target:'}{' '}
          <strong className="text-lg text-[#C84B31]">{data.target}</strong>
        </span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="grid grid-cols-6 gap-2 p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        {data.grid.map((tok, idx) => (
          <span
            key={idx}
            className="aspect-square flex items-center justify-center text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB]"
          >
            {tok}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {data.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => pickAnswer(opt)}
            className="h-12 rounded-xl bg-white dark:bg-[#25211D] hover:bg-[#C84B31] hover:text-white border border-[#E5DEC9] dark:border-[#342E28] font-mono-tabular font-bold text-lg text-[#1C1917] dark:text-[#F5F2EB] tactile-btn cursor-pointer"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 17. ODD ONE OUT
 * ============================================================================ */
const ODD_PAIRS = [
  { main: '🍎', odd: '🍅' },
  { main: '🌙', odd: '🌛' },
  { main: '🧭', odd: '⏱️' },
  { main: '🔷', odd: '🔶' },
  { main: '🌿', odd: '🍀' },
];

export const GameOddOneOut: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const size = round < 2 ? 3 : 4;
  const total = size * size;
  const oddIdx = useMemo(() => Math.floor(Math.random() * total), [round, total]);
  const pair = ODD_PAIRS[round % ODD_PAIRS.length];

  const handlePick = (idx: number) => {
    const correct = idx === oddIdx;
    const nextScore = correct ? score + 25 : score;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    if (round + 1 >= 5) {
      onFinish({
        outcome: nextScore >= 75 ? 'win' : 'draw',
        score: nextScore,
        summaryText: `${nextScore} pts`,
      });
    } else {
      setRound((r) => r + 1);
    }
  };

  return (
    <div className="max-w-sm mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{round + 1}/5</span>
        <span>{lang === 'ar' ? 'اضغط على العنصر المختلف' : 'Tap the odd item out'}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div
        className="grid gap-2 p-3 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: total }, (_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePick(idx)}
            className="aspect-square rounded-xl bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] text-2xl flex items-center justify-center hover:border-[#C84B31] tactile-btn cursor-pointer"
          >
            {idx === oddIdx ? pair.odd : pair.main}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 18. MENTAL MATH CHAIN
 * ============================================================================ */
function makeChain() {
  const start = Math.floor(Math.random() * 12) + 4;
  const add = Math.floor(Math.random() * 9) + 3;
  const mul = Math.floor(Math.random() * 3) + 2;
  const sub = Math.floor(Math.random() * 8) + 2;
  const answer = (start + add) * mul - sub;
  const opts = new Set([answer, answer + 4, answer - 3, answer + 8]);
  return {
    steps: [`${start}`, `+ ${add}`, `× ${mul}`, `- ${sub}`],
    answer,
    options: Array.from(opts).slice(0, 4).sort((a, b) => a - b),
  };
}

export const GameMentalMath: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [round, setRound] = useState(1);
  const [chain, setChain] = useState(() => makeChain());
  const [score, setScore] = useState(0);

  const pick = (val: number) => {
    const correct = val === chain.answer;
    const nextScore = correct ? score + 30 : score;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    if (round >= 4) {
      onFinish({
        outcome: nextScore >= 90 ? 'win' : 'draw',
        score: nextScore,
        summaryText: `${nextScore} pts`,
      });
    } else {
      setRound((r) => r + 1);
      setChain(makeChain());
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{round}/4</span>
        <span>{lang === 'ar' ? 'احسب السلسلة ذهنياً من اليسار لليمين' : 'Calculate step by step left-to-right'}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 py-5 px-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]" dir="ltr">
        {chain.steps.map((s, i) => (
          <React.Fragment key={i}>
            <span className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] font-mono-tabular text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB]">
              {s}
            </span>
            {i < chain.steps.length - 1 && <span className="text-[#C84B31] font-bold">→</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3" dir="ltr">
        {chain.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => pick(opt)}
            className="h-14 rounded-2xl bg-white dark:bg-[#25211D] hover:bg-[#C84B31] hover:text-white border border-[#E5DEC9] dark:border-[#342E28] font-mono-tabular text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB] tactile-btn cursor-pointer"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 19. LETTER ARRANGE (Rapid Anagram Sprint)
 * ============================================================================ */
export const GameLetterArrange: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const words = useMemo(() => SCRAMBLE_WORDS[lang].slice(0, 4).map((w) => w.word), [lang]);
  const [idx, setIdx] = useState(0);
  const word = words[idx];
  const [pool, setPool] = useState<string[]>(() => scrambleChars(word));
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1 && !doneRef.current) {
          doneRef.current = true;
          onFinish({ outcome: score >= 60 ? 'win' : 'draw', score, summaryText: `${score} pts` });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [score, onFinish]);

  const built = pickedIndices.map((pi) => pool[pi]).join('');

  const handleTapTile = (tileIdx: number) => {
    if (pickedIndices.includes(tileIdx) || doneRef.current) return;
    soundEngine.playClick();
    const nextPicked = [...pickedIndices, tileIdx];
    const nextBuilt = nextPicked.map((pi) => pool[pi]).join('');
    setPickedIndices(nextPicked);

    if (nextBuilt === word) {
      soundEngine.playPoint();
      const nextScore = score + 30;
      setScore(nextScore);
      onScoreProgress?.(nextScore);
      if (idx + 1 >= words.length) {
        doneRef.current = true;
        onFinish({ outcome: 'win', score: nextScore + timeLeft, summaryText: `${nextScore + timeLeft} pts` });
      } else {
        window.setTimeout(() => {
          const nw = words[idx + 1];
          setIdx((i) => i + 1);
          setPool(scrambleChars(nw));
          setPickedIndices([]);
        }, 350);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{idx + 1}/{words.length}</span>
        <span className="font-mono-tabular text-[#C84B31] flex items-center gap-1">
          <Timer className="w-3.5 h-3.5" /> {timeLeft}s
        </span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="min-h-14 px-4 py-3 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] font-display text-2xl font-bold tracking-widest text-[#1C1917] dark:text-[#F5F2EB]">
        {built || '—'}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {pool.map((ch, i) => {
          const used = pickedIndices.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={used}
              onClick={() => handleTapTile(i)}
              className={`w-12 h-12 rounded-xl font-display text-xl font-bold border transition-all ${
                used
                  ? 'opacity-30 bg-[#E5DEC9] dark:bg-[#342E28] border-transparent cursor-default'
                  : 'bg-white dark:bg-[#1E1B18] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#C84B31] tactile-btn cursor-pointer'
              }`}
            >
              {ch}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setPickedIndices([])}
        className="text-xs font-semibold text-[#2B4C7E] dark:text-[#60A5FA] inline-flex items-center gap-1 cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>{lang === 'ar' ? 'إعادة ترتيب' : 'Reset'}</span>
      </button>
    </div>
  );
};

/* ============================================================================
 * 20. RAPID QUESTIONS (3-Second True/False Blitz)
 * ============================================================================ */
export const GameRapidQuestions: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const items = useMemo(() => [...TRUE_FALSE_BANK].sort(() => Math.random() - 0.5).slice(0, 8), []);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3.5);
  const item = items[idx];

  useEffect(() => {
    const t = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          answer(null);
          return 3.5;
        }
        return Number((prev - 0.1).toFixed(1));
      });
    }, 100);
    return () => window.clearInterval(t);
  }, [idx]);

  const answer = (choice: boolean | null) => {
    const correct = choice !== null && choice === item.isTrue;
    const nextScore = correct ? score + 15 : score;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    if (idx + 1 >= items.length) {
      onFinish({
        outcome: nextScore >= 75 ? 'win' : 'draw',
        score: nextScore,
        summaryText: `${nextScore} pts`,
      });
    } else {
      setIdx((i) => i + 1);
      setTimeLeft(3.5);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{idx + 1}/{items.length}</span>
        <span className="font-mono-tabular text-[#C84B31]">{timeLeft.toFixed(1)}s</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="p-7 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        <p className="font-display text-lg sm:text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
          {item.statement[lang]}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => answer(true)}
          className="h-14 rounded-2xl bg-[#2D6A4F] hover:bg-[#23533D] text-white font-display font-bold flex items-center justify-center gap-2 tactile-btn cursor-pointer"
        >
          <Check className="w-5 h-5" />
          <span>{lang === 'ar' ? 'صح' : 'True'}</span>
        </button>
        <button
          type="button"
          onClick={() => answer(false)}
          className="h-14 rounded-2xl bg-[#C84B31] hover:bg-[#B03E26] text-white font-display font-bold flex items-center justify-center gap-2 tactile-btn cursor-pointer"
        >
          <X className="w-5 h-5" />
          <span>{lang === 'ar' ? 'خطأ' : 'False'}</span>
        </button>
      </div>
    </div>
  );
};
