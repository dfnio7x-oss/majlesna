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
          {lang === 'ar' ? `لوحة ${sketchRound}/3` : `Sketch ${sketchRound}/3`}
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
              if (mode === 'online' || sketchRound >= 3) {
                onFinish({ outcome: 'win', score: 95, summaryText: promptWord });
              } else {
                setSketchRound((r) => r + 1);
                setPromptIdx((i) => i + 1);
                setStrokes([]);
              }
            }}
            className="h-9 px-4 rounded-xl bg-[#2D6A4F] text-white text-xs font-semibold cursor-pointer"
          >
            {sketchRound >= 3 || mode === 'online'
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
      onFinish({ outcome: nextScore >= 60 ? 'win' : 'draw', score: nextScore, summaryText: `${nextScore} pts` });
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
      onFinish({ outcome: nextScore >= 75 ? 'win' : 'draw', score: nextScore, summaryText: `${nextScore} pts` });
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
      onFinish({ outcome: nextScore >= 75 ? 'win' : 'draw', score: nextScore, summaryText: `${nextScore} pts` });
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
export const GameRandomStory: React.FC<GameProps> = ({ lang, onFinish }) => {
  const [rolls, setRolls] = useState({ h: 0, s: 1, t: 2 });
  const [story, setStory] = useState('');

  const rollDice = () => {
    soundEngine.playClick();
    setRolls({
      h: Math.floor(Math.random() * STORY_DICE.heroes[lang].length),
      s: Math.floor(Math.random() * STORY_DICE.settings[lang].length),
      t: Math.floor(Math.random() * STORY_DICE.twists[lang].length),
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
          {lang === 'ar' ? 'ادمج العناصر الثلاثة في قصة قصيرة' : 'Weave all 3 rolled elements into a quick story'}
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
        rows={4}
        value={story}
        onChange={(e) => setStory(e.target.value)}
        placeholder={lang === 'ar' ? 'اكتب قصتك الطريفة هنا...' : 'Write your creative mini-story here...'}
        className="w-full p-4 rounded-2xl bg-white dark:bg-[#141210] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
      />

      <button
        type="button"
        disabled={story.trim().length < 10}
        onClick={() => {
          soundEngine.playPoint();
          onFinish({
            outcome: 'win',
            score: Math.min(110, 50 + Math.round(story.trim().length / 2)),
            summaryText: lang === 'ar' ? 'قصة إبداعية رائعة!' : 'Great imaginative story!',
          });
        }}
        className="w-full h-11 rounded-xl bg-[#2D6A4F] disabled:opacity-40 text-white text-sm font-semibold tactile-btn cursor-pointer"
      >
        {lang === 'ar' ? 'مشاركة القصة وإتمام الجولة' : 'Publish Story & Finish'}
      </button>
    </div>
  );
};

/* ============================================================================
 * 36. ACTING CHALLENGE (Charades Card + Timer)
 * ============================================================================ */
export const GameActingChallenge: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [idx, setIdx] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const prompt = ACTING_PROMPTS[idx % ACTING_PROMPTS.length];

  useEffect(() => {
    const t = window.setInterval(() => setTimeLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, [idx]);

  return (
    <div className="max-w-md mx-auto space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
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
            setIdx((i) => i + 1);
            setTimeLeft(30);
          }}
          className="h-12 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] cursor-pointer"
        >
          {lang === 'ar' ? 'بطاقة أخرى' : 'Next Card'}
        </button>
        <button
          type="button"
          onClick={() => {
            soundEngine.playPoint();
            const nextScore = score + 35;
            setScore(nextScore);
            onScoreProgress?.(nextScore);
            if (idx >= 2) {
              onFinish({ outcome: 'win', score: nextScore, summaryText: `${nextScore} pts` });
            } else {
              setIdx((i) => i + 1);
              setTimeLeft(30);
            }
          }}
          className="h-12 rounded-xl bg-[#2D6A4F] text-white text-xs font-semibold cursor-pointer"
        >
          {lang === 'ar' ? 'خمّنوها بنجاح! (+35)' : 'They Guessed It! (+35)'}
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
];

export const GameShadowGuess: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const card = SHADOW_CARDS[idx];

  const handlePick = (i: number) => {
    const correct = i === card.answerIndex;
    const nextScore = correct ? score + 35 : score;
    if (correct) {
      soundEngine.playPoint();
      setScore(nextScore);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }
    if (idx + 1 >= SHADOW_CARDS.length) {
      onFinish({ outcome: nextScore >= 70 ? 'win' : 'draw', score: nextScore, summaryText: `${nextScore} pts` });
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
export const GameSoundImitation: React.FC<GameProps> = ({ lang, onFinish }) => {
  const [idx, setIdx] = useState(0);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micNote, setMicNote] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(4);
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
          {lang === 'ar' ? 'صوت آخر' : 'New Prompt'}
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
          onFinish({
            outcome: rating >= 3 ? 'win' : 'draw',
            score: rating * 22,
            summaryText: `${rating}/5 ★ — ${prompt[lang]}`,
          });
        }}
        className="w-full h-11 rounded-xl bg-[#2D6A4F] text-white text-sm font-semibold cursor-pointer"
      >
        {lang === 'ar' ? 'اعتماد التقييم' : 'Confirm Performance'}
      </button>
    </div>
  );
};

/* ============================================================================
 * 39. JIGSAW ASSEMBLY (3x3 SVG Artwork Tile-Swap Puzzle)
 * ============================================================================ */
function makeScrambledTiles(): number[] {
  const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.every((v, i) => v === i) ? [1, 0, 2, 3, 4, 5, 6, 7, 8] : arr;
}

export const GameJigsawAssembly: React.FC<GameProps> = ({ lang, onFinish }) => {
  const [tiles, setTiles] = useState<number[]>(() => makeScrambledTiles());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [swaps, setSwaps] = useState(0);

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
      onFinish({
        outcome: 'win',
        score: Math.max(45, 130 - nextSwaps * 4),
        summaryText: lang === 'ar' ? `ركّبت اللوحة خلال ${nextSwaps} تبديل!` : `Assembled artwork in ${nextSwaps} swaps!`,
      });
    }
  };

  return (
    <div className="max-w-sm mx-auto space-y-4 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{lang === 'ar' ? 'اضغط على قطعتين لتبديل موقعهما' : 'Tap any 2 tiles to swap them'}</span>
        <span className="font-mono-tabular text-[#C84B31]">{swaps}</span>
      </div>

      <div className="grid grid-cols-3 gap-1 p-2 rounded-2xl bg-[#E5DEC9] dark:bg-[#342E28]" dir="ltr">
        {tiles.map((pieceId, slotIdx) => {
          const row = Math.floor(pieceId / 3);
          const col = pieceId % 3;
          const vx = col * 60;
          const vy = row * 60;
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
              <svg viewBox={`${vx} ${vy} 60 60`} className="w-full h-full block">
                <rect x="0" y="0" width="180" height="180" fill="#DBEAFE" />
                <circle cx="135" cy="40" r="22" fill="#F59E0B" />
                <polygon points="0,145 55,62 112,145" fill="#2D6A4F" />
                <polygon points="72,145 130,52 180,145" fill="#C84B31" />
                <rect x="0" y="142" width="180" height="38" fill="#1E3A8A" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * 40. WORD CHAIN (Timed Last-Letter Relay)
 * ============================================================================ */
export const GameWordChain: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const starter = lang === 'ar' ? 'شمس' : 'planet';
  const [chain, setChain] = useState<string[]>([starter]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    const score = (nextChain.length - 1) * 20;
    onScoreProgress?.(score);

    if (nextChain.length >= 6) {
      onFinish({
        outcome: 'win',
        score: score + 20,
        summaryText: nextChain.join(' → '),
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>{lang === 'ar' ? `السلسلة: ${chain.length - 1}/5` : `Chain: ${chain.length - 1}/5`}</span>
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
