import React, { useEffect, useRef, useState } from 'react';
import {
  Dices,
  Eraser,
  Film,
  Mic,
  Music,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  Star,
  Timer,
  Trash2,
} from 'lucide-react';
import type { GameProps } from './GameShell';
import type { DrawStroke } from '../../types/game';
import { DRAW_PROMPTS } from '../../data/questionBank';
import {
  ACTING_PROMPTS,
  EMOJI_RIDDLE_BANK,
  MOVIE_EMOJI_BANK,
  SONG_CLUE_BANK,
  SOUND_PROMPTS,
  STORY_DICE,
} from '../../data/phase2Bank';
import { normalizeChainChar, validateWordChainMove } from '../../utils/gameRules';
import { soundEngine } from '../../utils/soundEngine';

/* ============================================================================
 * 31. SKETCH RELAY (Timed Drawing Relay & Online Canvas Sync)
 * ============================================================================ */
const SKETCH_COLORS = ['#1C1917', '#C84B31', '#2D6A4F', '#2B4C7E', '#D97706'];

export const GameSketchRelay: React.FC<GameProps> = ({
  lang,
  mode,
  playerId,
  room,
  secrets,
  onFinish,
  onRoomAction,
  subscribeStrokes,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const strokeRef = useRef<DrawStroke | null>(null);
  const [color, setColor] = useState('#C84B31');
  const [isEraser, setIsEraser] = useState(false);
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [promptIdx, setPromptIdx] = useState(() => Math.floor(Math.random() * DRAW_PROMPTS.ar.length));
  const [sketchRound, setSketchRound] = useState(1);
  const [guessText, setGuessText] = useState('');

  const onlineState = mode === 'online' && room
    ? (room.gameState as { drawerId?: string; drawerName?: string; strokes?: DrawStroke[] })
    : null;
  const isDrawer = mode === 'online' ? onlineState?.drawerId === playerId : true;
  const promptWord =
    mode === 'online'
      ? lang === 'ar'
        ? secrets.drawWordAr
        : secrets.drawWordEn
      : DRAW_PROMPTS[lang][promptIdx % DRAW_PROMPTS[lang].length];

  const paintStroke = (ctx: CanvasRenderingContext2D, st: DrawStroke) => {
    if (!st.points.length) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = st.width;
    ctx.strokeStyle = st.isEraser ? '#FFFFFF' : st.color;
    ctx.beginPath();
    ctx.moveTo(st.points[0].x, st.points[0].y);
    st.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const list = mode === 'online' && onlineState?.strokes ? onlineState.strokes : strokes;
    list.forEach((s) => paintStroke(ctx, s));
  }, [strokes, onlineState?.strokes, mode]);

  useEffect(() => {
    if (mode !== 'online' || !subscribeStrokes) return;
    return subscribeStrokes((st) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) paintStroke(ctx, st);
    });
  }, [mode, subscribeStrokes]);

  const toPt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * c.width,
      y: ((e.clientY - rect.top) / rect.height) * c.height,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold">
        <span>
          {isDrawer
            ? `${lang === 'ar' ? 'ارسم سريعاً:' : 'Sketch prompt:'} `
            : `${lang === 'ar' ? 'يرسم:' : 'Drawing:'} ${onlineState?.drawerName ?? ''}`}
          {isDrawer && <strong className="text-[#C84B31] text-sm">{promptWord}</strong>}
        </span>
        <span className="font-mono-tabular text-[#57534E] dark:text-[#B8AFA3]">
          {mode === 'online'
            ? lang === 'ar'
              ? 'جولة جماعية'
              : 'Live Relay'
            : lang === 'ar'
            ? `لوحة ${sketchRound}/6`
            : `Sketch ${sketchRound}/6`}
        </span>
      </div>

      <div className="rounded-2xl border-2 border-[#E5DEC9] dark:border-[#342E28] overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={680}
          height={320}
          onPointerDown={(e) => {
            if (!isDrawer) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            drawingRef.current = true;
            strokeRef.current = { points: [toPt(e)], color, width: isEraser ? 14 : 5, isEraser };
          }}
          onPointerMove={(e) => {
            if (!drawingRef.current || !strokeRef.current) return;
            strokeRef.current.points.push(toPt(e));
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) paintStroke(ctx, strokeRef.current);
          }}
          onPointerUp={() => {
            if (!drawingRef.current || !strokeRef.current) return;
            drawingRef.current = false;
            const st = strokeRef.current;
            strokeRef.current = null;
            if (mode === 'online' && onRoomAction) onRoomAction({ action: 'draw_stroke', stroke: st });
            else setStrokes((prev) => [...prev, st]);
          }}
          className="w-full h-[240px] sm:h-[300px] touch-none block cursor-crosshair"
        />
      </div>

      {isDrawer ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {SKETCH_COLORS.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => {
                  setColor(hex);
                  setIsEraser(false);
                }}
                className={`w-7 h-7 rounded-full cursor-pointer ${color === hex && !isEraser ? 'ring-2 ring-offset-2 ring-[#C84B31]' : ''}`}
                style={{ backgroundColor: hex }}
              />
            ))}
            <button
              type="button"
              onClick={() => setIsEraser((v) => !v)}
              className={`h-8 px-2.5 rounded-lg border text-xs cursor-pointer ${
                isEraser ? 'bg-[#C84B31] text-white' : 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (mode === 'online') onRoomAction?.({ action: 'draw_clear' });
                else setStrokes([]);
              }}
              className="h-8 px-2.5 rounded-lg bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs text-[#C84B31] cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playPoint();
              if (mode === 'online' || sketchRound >= 6) {
                onFinish({ outcome: 'win', score: mode === 'online' ? 95 : 150, summaryText: promptWord });
              } else {
                setSketchRound((r) => r + 1);
                setPromptIdx((i) => i + 1);
                setStrokes([]);
              }
            }}
            className="h-9 px-4 rounded-xl bg-[#2D6A4F] text-white text-xs font-semibold cursor-pointer"
          >
            {sketchRound >= 6 || mode === 'online'
              ? lang === 'ar'
                ? 'إنهاء التتابع'
                : 'Finish Relay'
              : lang === 'ar'
              ? 'الرسمة التالية'
              : 'Next Sketch'}
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!guessText.trim()) return;
            onRoomAction?.({ action: 'draw_guess', text: guessText.trim() });
            setGuessText('');
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={guessText}
            onChange={(e) => setGuessText(e.target.value)}
            placeholder={lang === 'ar' ? 'اكتب تخمينك...' : 'Type your guess...'}
            className="flex-1 h-10 px-3 rounded-xl bg-white dark:bg-[#141210] border border-[#E5DEC9] dark:border-[#342E28] text-sm"
          />
          <button type="submit" className="h-10 px-4 rounded-xl bg-[#C84B31] text-white text-xs font-semibold cursor-pointer">
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};

/* ============================================================================
 * 32. GUESS THE SONG BY DESCRIPTION
 * ============================================================================ */
export const GameGuessSong: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [idx, setIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const item = SONG_CLUE_BANK[idx];

  const handlePick = (i: number) => {
    const correct = i === item.answerIndex;
    const pts = correct ? (showHint ? 20 : 30) : 0;
    const nextScore = score + pts;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    if (idx + 1 >= SONG_CLUE_BANK.length) {
      onFinish({ outcome: nextScore >= 120 ? 'win' : 'draw', score: nextScore, summaryText: `${nextScore} pts` });
    } else {
      setIdx((v) => v + 1);
      setShowHint(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{idx + 1}/{SONG_CLUE_BANK.length}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="p-6 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] space-y-3 text-center">
        <Music className="w-7 h-7 text-[#C84B31] mx-auto" />
        <p className="font-display text-lg font-bold text-[#1C1917] dark:text-[#F5F2EB] leading-relaxed">
          {item.description[lang]}
        </p>
        {showHint ? (
          <p className="text-xs font-semibold text-[#2B4C7E] dark:text-[#60A5FA]">{item.hint[lang]}</p>
        ) : (
          <button type="button" onClick={() => setShowHint(true)} className="text-xs text-[#C84B31] font-semibold cursor-pointer">
            {lang === 'ar' ? 'إظهار تلميح' : 'Show Hint'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {item.options[lang].map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handlePick(i)}
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
 * 33. MOVIE FROM EMOJI
 * ============================================================================ */
export const GameMovieEmoji: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const item = MOVIE_EMOJI_BANK[idx];

  const handlePick = (i: number) => {
    const correct = i === item.answerIndex;
    const nextScore = correct ? score + 25 : score;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    if (idx + 1 >= MOVIE_EMOJI_BANK.length) {
      onFinish({ outcome: nextScore >= 140 ? 'win' : 'draw', score: nextScore, summaryText: `${nextScore} pts` });
    } else {
      setIdx((v) => v + 1);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span className="flex items-center gap-1"><Film className="w-3.5 h-3.5 text-[#C84B31]" /> {idx + 1}/{MOVIE_EMOJI_BANK.length}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="py-8 px-4 rounded-3xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] space-y-2">
        <div className="text-5xl tracking-widest">{item.emojis}</div>
        <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">{item.hint[lang]}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {item.options[lang].map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handlePick(i)}
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
 * 34. EMOJI CHALLENGE
 * ============================================================================ */
export const GameEmojiChallenge: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const item = EMOJI_RIDDLE_BANK[idx];

  const handlePick = (i: number) => {
    const correct = i === item.answerIndex;
    const nextScore = correct ? score + 25 : score;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    if (idx + 1 >= EMOJI_RIDDLE_BANK.length) {
      onFinish({ outcome: nextScore >= 140 ? 'win' : 'draw', score: nextScore, summaryText: `${nextScore} pts` });
    } else {
      setIdx((v) => v + 1);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{item.category[lang]} ({idx + 1}/{EMOJI_RIDDLE_BANK.length})</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="py-8 rounded-3xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        <div className="text-5xl tracking-widest">{item.emojis}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {item.options[lang].map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handlePick(i)}
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
 * 35. RANDOM STORY COMPOSER (Story Dice)
 * ============================================================================ */
export const GameRandomStory: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [act, setAct] = useState(0);
  const [rolls, setRolls] = useState({ h: 0, s: 1, t: 2 });
  const [draft, setDraft] = useState('');
  const [actsDone, setActsDone] = useState<string[]>([]);

  const actLabels = [
    { ar: 'الفصل الأول: البداية', en: 'Act 1: Opening Scene' },
    { ar: 'الفصل الثاني: العقدة', en: 'Act 2: Rising Twist' },
    { ar: 'الفصل الثالث: الخاتمة', en: 'Act 3: Grand Finale' },
  ];

  const rollDice = () => {
    soundEngine.playClick();
    setRolls({
      h: Math.floor(Math.random() * STORY_DICE.heroes[lang].length),
      s: Math.floor(Math.random() * STORY_DICE.settings[lang].length),
      t: Math.floor(Math.random() * STORY_DICE.twists[lang].length),
    });
  };

  const commitAct = () => {
    const clean = draft.trim();
    if (clean.length < 8) return;
    soundEngine.playPoint();
    const updated = [...actsDone, clean];
    setActsDone(updated);
    setDraft('');
    onScoreProgress?.(updated.length * 45);
    if (updated.length >= 3) {
      const totalChars = updated.join(' ').length;
      onFinish({
        outcome: 'win',
        score: Math.min(160, 75 + Math.round(totalChars / 3)),
        summaryText: lang === 'ar' ? 'أكملت رواية من 3 فصول!' : 'Completed a 3-act storybook!',
      });
    } else {
      setAct(updated.length);
      rollDice();
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
          {actLabels[act][lang]} ({act + 1}/3)
        </span>
        <button
          type="button"
          onClick={rollDice}
          className="h-9 px-3 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#C84B31] flex items-center gap-1.5 cursor-pointer"
        >
          <Dices className="w-4 h-4" />
          <span>{lang === 'ar' ? 'ارمِ النرد' : 'Roll Dice'}</span>
        </button>
      </div>

      {actsDone.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] space-y-1.5 text-xs text-[#57534E] dark:text-[#B8AFA3]">
          {actsDone.map((line, i) => (
            <p key={i}>
              <strong className="text-[#C84B31] me-1">{i + 1}.</strong> {line}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: lang === 'ar' ? 'البطل' : 'Hero', val: STORY_DICE.heroes[lang][rolls.h] },
          { label: lang === 'ar' ? 'المكان' : 'Setting', val: STORY_DICE.settings[lang][rolls.s] },
          { label: lang === 'ar' ? 'المفاجأة' : 'Twist', val: STORY_DICE.twists[lang][rolls.t] },
        ].map((box, i) => (
          <div key={i} className="p-3.5 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-center">
            <p className="text-[11px] font-semibold text-[#C84B31]">{box.label}</p>
            <p className="font-display text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB] mt-1">{box.val}</p>
          </div>
        ))}
      </div>

      <textarea
        rows={3}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={lang === 'ar' ? 'اكتب فقرة هذا الفصل هنا...' : 'Write this act using the rolled dice...'}
        className="w-full p-4 rounded-2xl bg-white dark:bg-[#141210] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
      />

      <button
        type="button"
        disabled={draft.trim().length < 8}
        onClick={commitAct}
        className="w-full h-11 rounded-xl bg-[#2D6A4F] disabled:opacity-40 text-white text-sm font-semibold tactile-btn cursor-pointer"
      >
        {act < 2
          ? lang === 'ar'
            ? 'اعتماد الفصل والانتقال للتالي'
            : 'Save Act & Roll Next'
          : lang === 'ar'
          ? 'نشر القصة الكاملة'
          : 'Publish Complete Story'}
      </button>
    </div>
  );
};

/* ============================================================================
 * 36. ACTING CHALLENGE (Charades Card + Timer)
 * ============================================================================ */
export const GameActingChallenge: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const TOTAL_ROUNDS = 8;
  const [round, setRound] = useState(1);
  const [cardIdx, setCardIdx] = useState(() => Math.floor(Math.random() * ACTING_PROMPTS.length));
  const [hidden, setHidden] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const prompt = ACTING_PROMPTS[cardIdx % ACTING_PROMPTS.length];

  useEffect(() => {
    const t = window.setInterval(() => setTimeLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, [round, cardIdx]);

  return (
    <div className="max-w-md mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{round}/{TOTAL_ROUNDS}</span>
        <span className="font-mono-tabular text-[#C84B31] flex items-center gap-1">
          <Timer className="w-3.5 h-3.5" /> {timeLeft}s
        </span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="p-7 rounded-3xl bg-[#FAF8F4] dark:bg-[#25211D] border-2 border-[#E5DEC9] dark:border-[#342E28] space-y-3">
        <p className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
          {lang === 'ar' ? 'مثل هذا الموقف دون كلام!' : 'Act this out without speaking!'}
        </p>
        <p className="font-display text-2xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
          {hidden ? '••••••' : prompt[lang]}
        </p>
        <button
          type="button"
          onClick={() => setHidden((v) => !v)}
          className="text-xs font-semibold text-[#2B4C7E] dark:text-[#60A5FA] cursor-pointer"
        >
          {hidden ? (lang === 'ar' ? 'إظهار البطاقة' : 'Reveal Card') : (lang === 'ar' ? 'إخفاء عن الآخرين' : 'Hide from viewers')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setCardIdx((i) => i + 1);
            setTimeLeft(30);
          }}
          className="h-12 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] cursor-pointer"
        >
          {lang === 'ar' ? 'تغيير البطاقة' : 'Swap Card'}
        </button>
        <button
          type="button"
          onClick={() => {
            soundEngine.playPoint();
            const nextScore = score + 25;
            setScore(nextScore);
            onScoreProgress?.(nextScore);
            if (round >= TOTAL_ROUNDS) {
              onFinish({ outcome: 'win', score: nextScore, summaryText: `${nextScore} pts` });
            } else {
              setRound((r) => r + 1);
              setCardIdx((i) => i + 1);
              setTimeLeft(30);
            }
          }}
          className="h-12 rounded-xl bg-[#2D6A4F] text-white text-xs font-semibold cursor-pointer"
        >
          {lang === 'ar' ? 'خمّنوها بنجاح! (+25)' : 'They Guessed It! (+25)'}
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
 * 37. SHADOW GUESS (SVG Silhouette Recognition)
 * ============================================================================ */
const SHADOW_CARDS = [
  {
    options: { ar: ['دراجة هوائية', 'سيارة سباق', 'عربة تسوق', 'دراجة نارية'], en: ['Bicycle', 'Race Car', 'Shopping Cart', 'Scooter'] },
    answerIndex: 0,
    shape: (
      <g fill="currentColor">
        <circle cx="52" cy="110" r="24" fill="none" stroke="currentColor" strokeWidth="8" />
        <circle cx="148" cy="110" r="24" fill="none" stroke="currentColor" strokeWidth="8" />
        <path d="M52 110 L92 70 L132 70 L102 110 Z M132 70 L148 110 M84 56 L104 56 M124 52 L140 52" stroke="currentColor" strokeWidth="7" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  {
    options: { ar: ['مفتاح قديم', 'جيتار كلاسيكي', 'مطرقة', 'مصباح يدوي'], en: ['Antique Key', 'Acoustic Guitar', 'Hammer', 'Flashlight'] },
    answerIndex: 1,
    shape: (
      <g fill="currentColor">
        <ellipse cx="75" cy="108" rx="34" ry="26" />
        <ellipse cx="105" cy="96" rx="22" ry="18" />
        <rect x="115" y="70" width="52" height="10" transform="rotate(-24 115 70)" />
        <rect x="158" y="46" width="18" height="16" rx="4" transform="rotate(-24 158 46)" />
      </g>
    ),
  },
  {
    options: { ar: ['مظلة مطر', 'إبريق شاي', 'فنجان قهوة', 'ساعة رملية'], en: ['Rain Umbrella', 'Teapot', 'Coffee Mug', 'Hourglass'] },
    answerIndex: 1,
    shape: (
      <g fill="currentColor">
        <ellipse cx="100" cy="104" rx="38" ry="30" />
        <circle cx="100" cy="68" r="8" />
        <path d="M134 94 Q162 84 156 108 Q152 122 134 114" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
        <path d="M64 102 L42 78 L54 74 L68 92 Z" />
      </g>
    ),
  },
  {
    options: { ar: ['قلم حبر', 'صاروخ فضائي', 'شمعة', 'ناطحة سحاب'], en: ['Fountain Pen', 'Space Rocket', 'Candle', 'Skyscraper'] },
    answerIndex: 1,
    shape: (
      <g fill="currentColor">
        <path d="M100 22 C122 44 124 88 120 116 L80 116 C76 88 78 44 100 22 Z" />
        <polygon points="80,92 54,124 82,116" />
        <polygon points="120,92 146,124 118,116" />
        <polygon points="90,120 100,146 110,120" />
      </g>
    ),
  },
  {
    options: { ar: ['شجرة نخيل', 'مظلة مطر', 'خيمة سيرك', 'منطاد هوائي'], en: ['Palm Tree', 'Umbrella', 'Circus Tent', 'Air Balloon'] },
    answerIndex: 1,
    shape: (
      <g fill="currentColor">
        <path d="M36 88 C36 42 164 42 164 88 Q132 76 100 88 Q68 76 36 88 Z" />
        <path d="M100 40 L100 128 Q100 142 84 140" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      </g>
    ),
  },
  {
    options: { ar: ['منارة بحرية', 'برج ساعة', 'شجرة سرو', 'مئذنة أثرية'], en: ['Lighthouse', 'Clock Tower', 'Cypress Tree', 'Windmill'] },
    answerIndex: 0,
    shape: (
      <g fill="currentColor">
        <polygon points="82,142 90,54 110,54 118,142" />
        <rect x="86" y="38" width="28" height="18" rx="3" />
        <polygon points="82,38 100,20 118,38" />
        <polygon points="116,42 172,26 172,58" opacity="0.55" />
        <polygon points="84,42 28,26 28,58" opacity="0.55" />
      </g>
    ),
  },
  {
    options: { ar: ['فراشة', 'بومة ليلية', 'بطريق', 'قطة منزلية'], en: ['Butterfly', 'Owl', 'Penguin', 'House Cat'] },
    answerIndex: 1,
    shape: (
      <g fill="currentColor">
        <ellipse cx="100" cy="96" rx="34" ry="42" />
        <circle cx="80" cy="54" r="16" />
        <circle cx="120" cy="54" r="16" />
        <polygon points="68,42 74,30 84,42" />
        <polygon points="132,42 126,30 116,42" />
        <polygon points="94,72 106,72 100,84" />
      </g>
    ),
  },
  {
    options: { ar: ['قطار بخاري', 'جرار زراعي', 'غواصة', 'حافلة مدرسية'], en: ['Steam Train', 'Tractor', 'Submarine', 'School Bus'] },
    answerIndex: 0,
    shape: (
      <g fill="currentColor">
        <rect x="44" y="68" width="76" height="44" rx="6" />
        <rect x="114" y="44" width="38" height="68" rx="4" />
        <rect x="56" y="42" width="16" height="28" rx="3" />
        <circle cx="66" cy="122" r="14" />
        <circle cx="102" cy="122" r="14" />
        <circle cx="136" cy="122" r="14" />
      </g>
    ),
  },
  {
    options: { ar: ['شوكة طعام', 'تاج ملكي', 'سياج حديقة', 'موجة بحر'], en: ['Dinner Fork', 'Royal Crown', 'Garden Fence', 'Ocean Wave'] },
    answerIndex: 1,
    shape: (
      <g fill="currentColor">
        <polygon points="36,120 44,54 74,88 100,40 126,88 156,54 164,120" />
        <rect x="34" y="124" width="132" height="16" rx="5" />
      </g>
    ),
  },
  {
    options: { ar: ['طائرة ورقية', 'مركب شراعي', 'هرم زجاجي', 'خيمة صحراوية'], en: ['Paper Kite', 'Sailboat', 'Glass Pyramid', 'Desert Tent'] },
    answerIndex: 1,
    shape: (
      <g fill="currentColor">
        <polygon points="100,26 100,104 48,104" />
        <polygon points="106,40 106,104 148,104" />
        <polygon points="36,112 164,112 142,138 58,138" />
      </g>
    ),
  },
];

export const GameShadowGuess: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const card = SHADOW_CARDS[idx];

  const handlePick = (i: number) => {
    const correct = i === card.answerIndex;
    const nextScore = correct ? score + 22 : score;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    if (idx + 1 >= SHADOW_CARDS.length) {
      onFinish({ outcome: nextScore >= 140 ? 'win' : 'draw', score: nextScore, summaryText: `${nextScore} pts` });
    } else {
      setIdx((v) => v + 1);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{idx + 1}/{SHADOW_CARDS.length}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{score} pts</span>
      </div>

      <div className="p-6 rounded-3xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] flex justify-center">
        <svg viewBox="0 0 200 160" className="w-56 h-40 text-[#1C1917] dark:text-[#F5F2EB]">
          {card.shape}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {card.options[lang].map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handlePick(i)}
            className="h-12 px-3 rounded-xl bg-white dark:bg-[#25211D] hover:bg-[#C84B31] hover:text-white border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] tactile-btn cursor-pointer"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 38. SOUND IMITATION (Prompt Deck + Optional Mic Clip + Peer Rating)
 * ============================================================================ */
export const GameSoundImitation: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const TOTAL_ROUNDS = 5;
  const [round, setRound] = useState(1);
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * SOUND_PROMPTS.length));
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micNote, setMicNote] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(4);
  const [totalScore, setTotalScore] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const prompt = SOUND_PROMPTS[idx % SOUND_PROMPTS.length];

  const startRec = async () => {
    setMicNote(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMicNote(lang === 'ar' ? 'قلّد الصوت مباشرة أمام أصدقائك!' : 'Perform the sound effect live for your group!');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (ev) => chunks.push(ev.data);
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((tr) => tr.stop());
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      setMicNote(lang === 'ar' ? 'الميكروفون غير متاح — أدِّ الصوت مباشرة!' : 'Mic unavailable — perform the sound live!');
    }
  };

  const stopRec = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{round}/{TOTAL_ROUNDS}</span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">{totalScore} pts</span>
      </div>

      <div className="p-6 rounded-3xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] space-y-2">
        <span className="text-[11px] font-bold uppercase text-[#C84B31]">{prompt.category[lang]}</span>
        <h2 className="font-display text-2xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
          {prompt[lang]}
        </h2>
      </div>

      <div className="flex justify-center gap-2">
        {!recording ? (
          <button
            type="button"
            onClick={startRec}
            className="h-11 px-4 rounded-xl bg-[#C84B31] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تسجيل مقطع صوتي' : 'Record Clip'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRec}
            className="h-11 px-4 rounded-xl bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Square className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إيقاف التسجيل' : 'Stop Recording'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setIdx((i) => i + 1);
            setAudioUrl(null);
            setMicNote(null);
          }}
          className="h-11 px-4 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] cursor-pointer"
        >
          {lang === 'ar' ? 'تغيير الصوت' : 'Swap Prompt'}
        </button>
      </div>

      {micNote && <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">{micNote}</p>}
      {audioUrl && <audio controls src={audioUrl} className="w-full" />}

      <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] space-y-2">
        <p className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
          {lang === 'ar' ? 'تقييم الأصدقاء للأداء:' : 'Group Performance Rating:'}
        </p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setRating(n);
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border cursor-pointer ${
                n <= rating ? 'bg-[#D97706] text-white border-[#D97706]' : 'bg-white dark:bg-[#1E1B18] border-[#E5DEC9] dark:border-[#342E28] text-[#57534E]'
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          soundEngine.playPoint();
          const nextTotal = totalScore + rating * 8;
          setTotalScore(nextTotal);
          onScoreProgress?.(nextTotal);
          if (round >= TOTAL_ROUNDS) {
            onFinish({
              outcome: nextTotal >= 100 ? 'win' : 'draw',
              score: nextTotal,
              summaryText: `${nextTotal} pts (${TOTAL_ROUNDS}/5 ★)`,
            });
          } else {
            setRound((r) => r + 1);
            setIdx((i) => i + 1);
            setAudioUrl(null);
            setMicNote(null);
          }
        }}
        className="w-full h-11 rounded-xl bg-[#2D6A4F] text-white text-sm font-semibold cursor-pointer"
      >
        {round >= TOTAL_ROUNDS
          ? lang === 'ar'
            ? 'اعتماد التقييم النهائي'
            : 'Finish Showcase'
          : lang === 'ar'
          ? 'اعتماد الجولة والانتقال للتالية'
          : 'Confirm & Next Sound'}
      </button>
    </div>
  );
};

/* ============================================================================
 * 39. JIGSAW ASSEMBLY (4-Stage SVG Artwork Tile-Swap Campaign: 3x3 -> 4x4)
 * ============================================================================ */
function makeScrambledTiles(gridDim: number): number[] {
  const arr = Array.from({ length: gridDim * gridDim }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arr.every((v, i) => v === i)) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

const JIGSAW_STAGES = [
  {
    title: { ar: 'شروق الجبال', en: 'Alpine Sunrise' },
    dim: 3,
    art: (
      <>
        <rect x="0" y="0" width="180" height="180" fill="#DBEAFE" />
        <circle cx="135" cy="40" r="22" fill="#F59E0B" />
        <polygon points="0,145 55,62 112,145" fill="#2D6A4F" />
        <polygon points="72,145 130,52 180,145" fill="#C84B31" />
        <rect x="0" y="142" width="180" height="38" fill="#1E3A8A" />
      </>
    ),
  },
  {
    title: { ar: 'الواحة الصحراوية', en: 'Desert Oasis Dusk' },
    dim: 3,
    art: (
      <>
        <rect x="0" y="0" width="180" height="180" fill="#FDE68A" />
        <circle cx="48" cy="44" r="20" fill="#EA580C" />
        <path d="M0 112 Q90 88 180 112 L180 180 L0 180 Z" fill="#D97706" />
        <ellipse cx="115" cy="148" rx="44" ry="14" fill="#0EA5E9" />
        <rect x="74" y="88" width="7" height="58" fill="#78350F" />
        <ellipse cx="77" cy="86" rx="22" ry="10" fill="#15803D" />
      </>
    ),
  },
  {
    title: { ar: 'الكوكب ذو الحلقات', en: 'Cosmic Ringed Planet' },
    dim: 4,
    art: (
      <>
        <rect x="0" y="0" width="180" height="180" fill="#0F172A" />
        <circle cx="30" cy="34" r="3" fill="#FDE047" />
        <circle cx="144" cy="28" r="2.5" fill="#FFFFFF" />
        <circle cx="152" cy="144" r="3" fill="#93C5FD" />
        <circle cx="34" cy="142" r="2.5" fill="#FFFFFF" />
        <circle cx="90" cy="90" r="36" fill="#C84B31" />
        <ellipse cx="90" cy="90" rx="68" ry="16" fill="none" stroke="#FBBF24" strokeWidth="7" transform="rotate(-18 90 90)" />
        <circle cx="76" cy="78" r="8" fill="#FDBA74" />
      </>
    ),
  },
  {
    title: { ar: 'منارة الميناء', en: 'Coastal Harbor Beacon' },
    dim: 4,
    art: (
      <>
        <rect x="0" y="0" width="180" height="180" fill="#BAE6FD" />
        <polygon points="102,42 180,14 180,70" fill="#FEF08A" opacity="0.85" />
        <rect x="72" y="54" width="28" height="82" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
        <rect x="72" y="74" width="28" height="20" fill="#C84B31" />
        <polygon points="68,54 86,32 104,54" fill="#1E293B" />
        <rect x="0" y="132" width="180" height="48" fill="#0369A1" />
        <polygon points="122,130 162,130 152,144 132,144" fill="#92400E" />
      </>
    ),
  },
];

export const GameJigsawAssembly: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [stageIdx, setStageIdx] = useState(0);
  const stage = JIGSAW_STAGES[stageIdx];
  const [tiles, setTiles] = useState<number[]>(() => makeScrambledTiles(stage.dim));
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [swaps, setSwaps] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const cellSize = 180 / stage.dim;

  const handleSlotTap = (slotIdx: number) => {
    if (selectedSlot === null) {
      soundEngine.playClick();
      setSelectedSlot(slotIdx);
      return;
    }
    if (selectedSlot === slotIdx) {
      setSelectedSlot(null);
      return;
    }
    soundEngine.playClick();
    const next = [...tiles];
    [next[selectedSlot], next[slotIdx]] = [next[slotIdx], next[selectedSlot]];
    const nextSwaps = swaps + 1;
    setTiles(next);
    setSelectedSlot(null);
    setSwaps(nextSwaps);

    if (next.every((v, i) => v === i)) {
      soundEngine.playPoint();
      const stagePts = Math.max(30, 80 - nextSwaps * 2);
      const nextScore = totalScore + stagePts;
      setTotalScore(nextScore);
      onScoreProgress?.(nextScore);
      if (stageIdx + 1 >= JIGSAW_STAGES.length) {
        onFinish({
          outcome: 'win',
          score: nextScore,
          summaryText: lang === 'ar' ? `أتممت ٤ لوحات (${nextScore} نقطة)!` : `Solved all 4 artworks (${nextScore} pts)!`,
        });
      } else {
        window.setTimeout(() => {
          const nextStage = JIGSAW_STAGES[stageIdx + 1];
          setStageIdx((s) => s + 1);
          setTiles(makeScrambledTiles(nextStage.dim));
          setSelectedSlot(null);
          setSwaps(0);
        }, 450);
      }
    }
  };

  return (
    <div className="max-w-sm mx-auto space-y-4 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{stage.title[lang]} ({stageIdx + 1}/{JIGSAW_STAGES.length})</span>
        <span className="font-mono-tabular text-[#C84B31]">{swaps} swaps • {totalScore} pts</span>
      </div>

      <div
        className="grid gap-1 p-2 rounded-2xl bg-[#E5DEC9] dark:bg-[#342E28]"
        style={{ gridTemplateColumns: `repeat(${stage.dim}, minmax(0, 1fr))` }}
        dir="ltr"
      >
        {tiles.map((pieceId, slotIdx) => {
          const row = Math.floor(pieceId / stage.dim);
          const col = pieceId % stage.dim;
          const vx = col * cellSize;
          const vy = row * cellSize;
          const active = selectedSlot === slotIdx;
          const rightSpot = pieceId === slotIdx;
          return (
            <button
              key={slotIdx}
              type="button"
              onClick={() => handleSlotTap(slotIdx)}
              className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-transform ${
                active
                  ? 'border-[#C84B31] scale-95'
                  : rightSpot
                  ? 'border-[#2D6A4F]/60'
                  : 'border-transparent'
              }`}
            >
              <svg viewBox={`${vx} ${vy} ${cellSize} ${cellSize}`} className="w-full h-full block">
                {stage.art}
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * 40. WORD CHAIN (12-Word Timed Last-Letter Relay)
 * ============================================================================ */
const CHAIN_STARTERS = {
  ar: ['شمس', 'قمر', 'نور', 'بحر', 'كتاب', 'سفر'],
  en: ['planet', 'bridge', 'castle', 'lantern', 'market', 'stream'],
};

export const GameWordChain: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [starter] = useState(() => CHAIN_STARTERS[lang][Math.floor(Math.random() * CHAIN_STARTERS[lang].length)]);
  const [chain, setChain] = useState<string[]>(() => [starter]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const TARGET_WORDS = 12;

  const lastWord = chain[chain.length - 1];
  const lastChars = Array.from(lastWord);
  const reqChar = normalizeChainChar(lastChars[lastChars.length - 1] ?? '');

  const submitWord = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateWordChainMove(lastWord, input, chain);
    if (!check.ok) {
      soundEngine.playError();
      setError(
        check.reason === 'duplicate'
          ? lang === 'ar'
            ? 'كلمة مكررة!'
            : 'Word already used!'
          : check.reason === 'wrong_start'
          ? lang === 'ar'
            ? `يجب أن تبدأ بحرف «${reqChar}»`
            : `Must start with "${reqChar.toUpperCase()}"`
          : lang === 'ar'
          ? 'أدخل كلمة من حرفين فأكثر'
          : 'Enter at least 2 letters'
      );
      return;
    }

    soundEngine.playPoint();
    const nextChain = [...chain, input.trim()];
    setChain(nextChain);
    setInput('');
    setError(null);
    const score = (nextChain.length - 1) * 15;
    onScoreProgress?.(score);

    if (nextChain.length >= TARGET_WORDS + 1) {
      onFinish({
        outcome: 'win',
        score: score + 25,
        summaryText: nextChain.join(' → '),
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{lang === 'ar' ? `السلسلة: ${chain.length - 1}/${TARGET_WORDS}` : `Chain: ${chain.length - 1}/${TARGET_WORDS}`}</span>
        <span>
          {lang === 'ar' ? 'ابدأ بحرف:' : 'Next starts with:'}{' '}
          <strong className="text-base text-[#C84B31]">{reqChar.toUpperCase()}</strong>
        </span>
      </div>

      <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28]">
        {chain.map((w, i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-xl bg-white dark:bg-[#1E1B18] border border-[#E5DEC9] dark:border-[#342E28] text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB]"
          >
            {w}
          </span>
        ))}
      </div>

      <form onSubmit={submitWord} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            lang === 'ar' ? `اكتب كلمة تبدأ بـ ${reqChar}...` : `Word starting with "${reqChar}"...`
          }
          className="flex-1 h-11 px-3.5 rounded-xl bg-white dark:bg-[#141210] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB]"
        />
        <button
          type="submit"
          className="h-11 px-5 rounded-xl bg-[#C84B31] text-white text-xs font-semibold cursor-pointer"
        >
          {lang === 'ar' ? 'أضف' : 'Chain'}
        </button>
      </form>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
};
