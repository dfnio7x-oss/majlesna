import React, { useEffect, useRef, useState } from 'react';
import { Eraser, RotateCcw, Send, Trash2 } from 'lucide-react';
import type { GameProps } from './GameShell';
import type { DrawStroke } from '../../types/game';
import { DRAW_PROMPTS } from '../../data/questionBank';
import { soundEngine } from '../../utils/soundEngine';

const PALETTE = ['#1C1917', '#C84B31', '#2D6A4F', '#2B4C7E', '#D97706', '#7C3AED'];
const LOCAL_DRAW_STAGES = 6;

export const GameDrawGuess: React.FC<GameProps> = ({
  lang,
  mode,
  playerId,
  room,
  secrets,
  onFinish,
  onScoreProgress,
  onRoomAction,
  subscribeStrokes,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const activeStrokeRef = useRef<DrawStroke | null>(null);

  const [color, setColor] = useState('#1C1917');
  const [brushWidth, setBrushWidth] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [localStrokes, setLocalStrokes] = useState<DrawStroke[]>([]);
  const [guessInput, setGuessInput] = useState('');

  // Solo / Local Pass & Play 6-stage state
  const [localStage, setLocalStage] = useState(1);
  const [localScore, setLocalScore] = useState(0);
  const [localPromptIdx, setLocalPromptIdx] = useState(() =>
    Math.floor(Math.random() * DRAW_PROMPTS.ar.length)
  );
  const [localGuessResult, setLocalGuessResult] = useState<string | null>(null);
  const [hideWordForFriend, setHideWordForFriend] = useState(false);

  const onlineState = mode === 'online' && room
    ? (room.gameState as {
        drawerId?: string;
        drawerName?: string;
        strokes?: DrawStroke[];
        guessedIds?: string[];
        revealedWord?: string | null;
      })
    : null;

  const isDrawer = mode === 'online' ? onlineState?.drawerId === playerId : true;
  const wordAr = mode === 'online' ? secrets.drawWordAr : DRAW_PROMPTS.ar[localPromptIdx];
  const wordEn = mode === 'online' ? secrets.drawWordEn : DRAW_PROMPTS.en[localPromptIdx];
  const displayWord = lang === 'ar' ? wordAr : wordEn;

  const drawStrokeOnCanvas = (ctx: CanvasRenderingContext2D, stroke: DrawStroke) => {
    if (stroke.points.length === 0) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = stroke.width;
    ctx.strokeStyle = stroke.isEraser ? '#FFFFFF' : stroke.color;
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    if (stroke.points.length === 1) {
      ctx.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y + 0.1);
    }
    ctx.stroke();
    ctx.restore();
  };

  const redrawAll = (strokesList: DrawStroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    strokesList.forEach((s) => drawStrokeOnCanvas(ctx, s));
  };

  useEffect(() => {
    if (mode === 'online' && onlineState?.strokes) {
      redrawAll(onlineState.strokes);
    } else {
      redrawAll(localStrokes);
    }
  }, [mode, onlineState?.strokes, localStrokes]);

  useEffect(() => {
    if (mode !== 'online' || !subscribeStrokes) return;
    return subscribeStrokes((stroke) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) drawStrokeOnCanvas(ctx, stroke);
    });
  }, [mode, subscribeStrokes]);

  useEffect(() => {
    if (mode === 'online' && room?.status === 'results') {
      const me = room.players.find((p) => p.id === playerId);
      onFinish({
        outcome: (me?.roundScore ?? 0) > 0 ? 'win' : 'draw',
        score: me?.roundScore ?? 30,
        summaryText: onlineState?.revealedWord
          ? `${lang === 'ar' ? 'الكلمة:' : 'Word:'} ${onlineState.revealedWord}`
          : undefined,
      });
    }
  }, [room?.status]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pt = getCanvasPoint(e);
    activeStrokeRef.current = {
      points: [pt],
      color,
      width: isEraser ? brushWidth * 2.2 : brushWidth,
      isEraser,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !activeStrokeRef.current) return;
    const pt = getCanvasPoint(e);
    activeStrokeRef.current.points.push(pt);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) drawStrokeOnCanvas(ctx, activeStrokeRef.current);
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current || !activeStrokeRef.current) return;
    isDrawingRef.current = false;
    const finishedStroke = activeStrokeRef.current;
    activeStrokeRef.current = null;
    if (mode === 'online' && onRoomAction) {
      onRoomAction({ action: 'draw_stroke', stroke: finishedStroke });
    } else {
      setLocalStrokes((prev) => [...prev, finishedStroke]);
    }
  };

  const handleClear = () => {
    soundEngine.playClick();
    if (mode === 'online' && onRoomAction) {
      onRoomAction({ action: 'draw_clear' });
    } else {
      setLocalStrokes([]);
    }
  };

  const handleUndo = () => {
    soundEngine.playClick();
    if (mode === 'online' && onRoomAction) {
      onRoomAction({ action: 'draw_undo' });
    } else {
      setLocalStrokes((prev) => prev.slice(0, -1));
    }
  };

  const completeLocalStage = (stagePoints: number, feedbackMsg?: string) => {
    const nextScore = localScore + stagePoints;
    setLocalScore(nextScore);
    onScoreProgress?.(nextScore);

    if (localStage >= LOCAL_DRAW_STAGES) {
      onFinish({
        outcome: 'win',
        score: nextScore,
        summaryText:
          lang === 'ar'
            ? `أنجزت جميع لوحات الرسم الست! آخر كلمة: ${displayWord}`
            : `Completed all 6 sketch stages! Last word: ${displayWord}`,
      });
      return;
    }

    if (feedbackMsg) setLocalGuessResult(feedbackMsg);
    window.setTimeout(() => {
      setLocalStage((s) => s + 1);
      setLocalPromptIdx((i) => (i + 7) % DRAW_PROMPTS.ar.length);
      setLocalStrokes([]);
      setLocalGuessResult(null);
      setHideWordForFriend(false);
    }, 650);
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = guessInput.trim();
    if (!text) return;
    setGuessInput('');

    if (mode === 'online' && onRoomAction) {
      soundEngine.playClick();
      onRoomAction({ action: 'draw_guess', text });
      return;
    }

    const match =
      text.toLowerCase() === (wordAr ?? '').toLowerCase() ||
      text.toLowerCase() === (wordEn ?? '').toLowerCase();
    if (match) {
      soundEngine.playPoint();
      completeLocalStage(30, lang === 'ar' ? 'إجابة صحيحة! جاري الانتقال للوحة التالية...' : 'Correct! Next prompt...');
    } else {
      soundEngine.playError();
      setLocalGuessResult(lang === 'ar' ? 'حاول مرة أخرى!' : 'Not quite, try again!');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl px-4 py-3">
        {isDrawer ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
              {lang === 'ar' ? 'ارسم هذه الكلمة:' : 'Sketch this word:'}
            </span>
            <button
              type="button"
              onClick={() => setHideWordForFriend((v) => !v)}
              className="px-3 py-1 rounded-lg bg-[#C84B31] text-white font-display font-bold text-sm cursor-pointer"
            >
              {hideWordForFriend ? (lang === 'ar' ? 'اضغط للإظهار' : 'Tap to reveal') : displayWord}
            </button>
          </div>
        ) : (
          <span className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
            {lang === 'ar'
              ? `يرسم الآن: ${onlineState?.drawerName ?? ''}`
              : `Drawing now: ${onlineState?.drawerName ?? ''}`}
          </span>
        )}

        {mode !== 'online' && (
          <div className="flex items-center gap-3">
            <span className="font-mono-tabular text-xs font-bold text-[#2D6A4F]">
              {lang === 'ar' ? `لوحة ${localStage}/${LOCAL_DRAW_STAGES}` : `Stage ${localStage}/${LOCAL_DRAW_STAGES}`} · {localScore} pts
            </span>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setLocalPromptIdx((i) => (i + 1) % DRAW_PROMPTS.ar.length);
                setLocalStrokes([]);
                setLocalGuessResult(null);
              }}
              className="text-xs font-semibold text-[#2B4C7E] cursor-pointer"
            >
              {lang === 'ar' ? 'كلمة جديدة' : 'New Prompt'}
            </button>
          </div>
        )}
      </div>

      {/* Drawing Canvas */}
      <div className="rounded-2xl border-2 border-[#E5DEC9] dark:border-[#342E28] overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={720}
          height={380}
          data-testid="draw-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`w-full h-[260px] sm:h-[340px] touch-none block ${
            isDrawer ? 'cursor-crosshair' : 'cursor-default'
          }`}
        />
      </div>

      {/* Tools for Drawer */}
      {isDrawer && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                onClick={() => {
                  setColor(c);
                  setIsEraser(false);
                }}
                className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${
                  color === c && !isEraser ? 'scale-115 ring-2 ring-offset-2 ring-[#1C1917]' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <button
              type="button"
              onClick={() => setIsEraser((v) => !v)}
              aria-label="Eraser"
              className={`h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                isEraser ? 'bg-[#1C1917] text-white border-[#1C1917]' : 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
            <select
              value={brushWidth}
              onChange={(e) => setBrushWidth(Number(e.target.value))}
              aria-label="Brush size"
              className="h-8 px-2 rounded-lg bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs"
            >
              <option value={3}>S</option>
              <option value={6}>M</option>
              <option value={12}>L</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              className="h-8 px-3 rounded-lg bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'تراجع' : 'Undo'}</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="h-8 px-3 rounded-lg bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold text-[#C84B31] flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'مسح' : 'Clear'}</span>
            </button>
            {mode !== 'online' && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPoint();
                  completeLocalStage(25);
                }}
                className="h-8 px-4 rounded-lg bg-[#2D6A4F] text-white text-xs font-semibold cursor-pointer"
              >
                {localStage >= LOCAL_DRAW_STAGES
                  ? lang === 'ar' ? 'إنهاء الرسم' : 'Finish Sketch'
                  : lang === 'ar' ? 'اللوحة التالية' : 'Next Sketch'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Guess Input (Online Guessers or Local Pass & Play Friend) */}
      {(!isDrawer || mode === 'local') && (
        <form onSubmit={handleGuessSubmit} className="flex gap-2">
          <input
            type="text"
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            placeholder={lang === 'ar' ? 'اكتب تخمينك للكلمة المرسومة...' : 'Type your guess...'}
            className="flex-1 h-10 px-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#C84B31]"
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-xl bg-[#C84B31] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'تخمين' : 'Guess'}</span>
          </button>
        </form>
      )}
      {localGuessResult && (
        <p className="text-xs font-semibold text-[#C84B31]">{localGuessResult}</p>
      )}
    </div>
  );
};
