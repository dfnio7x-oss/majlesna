import React, { useEffect, useRef, useState } from 'react';
import type { GameProps } from './GameShell';
import { soundEngine } from '../../utils/soundEngine';

const STROOP_COLORS = [
  { key: 'red', hex: '#C84B31', ar: 'أحمر', en: 'RED' },
  { key: 'green', hex: '#2D6A4F', ar: 'أخضر', en: 'GREEN' },
  { key: 'blue', hex: '#2B4C7E', ar: 'أزرق', en: 'BLUE' },
  { key: 'amber', hex: '#D97706', ar: 'أصفر', en: 'AMBER' },
];

export const GameSpeedChallenge: React.FC<GameProps> = ({
  lang,
  onFinish,
  onScoreProgress,
}) => {
  const [stage, setStage] = useState<'reflex' | 'targets' | 'stroop'>('reflex');
  const [score, setScore] = useState(0);

  // Stage 1: Reflex Light
  const [lightState, setLightState] = useState<'waiting' | 'ready' | 'early' | 'done'>('waiting');
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Stage 2: Target Burst (5 targets)
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [targetsLeft, setTargetsLeft] = useState(5);

  // Stage 3: Stroop Test (4 rounds)
  const [stroopRound, setStroopRound] = useState(0);
  const [stroopWord, setStroopWord] = useState(STROOP_COLORS[0]);
  const [stroopInk, setStroopInk] = useState(STROOP_COLORS[1]);

  useEffect(() => {
    if (stage !== 'reflex' || lightState !== 'waiting') return;
    const delay = 1400 + Math.random() * 1800;
    const timer = window.setTimeout(() => {
      startTimeRef.current = performance.now();
      setLightState('ready');
    }, delay);
    return () => window.clearTimeout(timer);
  }, [stage, lightState]);

  const handleReflexTap = () => {
    if (lightState === 'waiting') {
      soundEngine.playError();
      setLightState('early');
      window.setTimeout(() => setLightState('waiting'), 900);
      return;
    }
    if (lightState === 'ready') {
      const ms = Math.round(performance.now() - startTimeRef.current);
      setReactionMs(ms);
      setLightState('done');
      soundEngine.playPoint();
      const bonus = Math.max(15, Math.round(60 - ms / 15));
      const nextScore = score + bonus;
      setScore(nextScore);
      onScoreProgress?.(nextScore);
      window.setTimeout(() => {
        setStage('targets');
        setTargetPos({ x: 25 + Math.random() * 50, y: 25 + Math.random() * 50 });
      }, 900);
    }
  };

  const handleTargetClick = () => {
    soundEngine.playPoint();
    const nextScore = score + 15;
    setScore(nextScore);
    onScoreProgress?.(nextScore);

    if (targetsLeft <= 1) {
      setStage('stroop');
      pickNextStroop();
    } else {
      setTargetsLeft((n) => n - 1);
      setTargetPos({
        x: 15 + Math.random() * 70,
        y: 18 + Math.random() * 64,
      });
    }
  };

  const pickNextStroop = () => {
    const w = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    let ink = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
    if (ink.key === w.key) {
      ink = STROOP_COLORS[(STROOP_COLORS.indexOf(w) + 1) % STROOP_COLORS.length];
    }
    setStroopWord(w);
    setStroopInk(ink);
  };

  const handleStroopPick = (key: string) => {
    const correct = key === stroopInk.key;
    const nextScore = score + (correct ? 20 : 0);
    if (correct) soundEngine.playPoint();
    else soundEngine.playError();
    setScore(nextScore);
    onScoreProgress?.(nextScore);

    if (stroopRound >= 3) {
      onFinish({
        outcome: nextScore >= 85 ? 'win' : 'draw',
        score: nextScore,
        summaryText:
          reactionMs !== null
            ? lang === 'ar'
              ? `سرعة رد فعلك: ${reactionMs} مللي ثانية`
              : `Your reaction time: ${reactionMs} ms`
            : undefined,
      });
    } else {
      setStroopRound((r) => r + 1);
      pickNextStroop();
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span>
          {stage === 'reflex'
            ? lang === 'ar' ? 'المرحلة ١/٣: سرعة الإشارة' : 'Stage 1/3: Reflex Signal'
            : stage === 'targets'
            ? lang === 'ar' ? 'المرحلة ٢/٣: التقاط الأهداف' : 'Stage 2/3: Target Burst'
            : lang === 'ar' ? 'المرحلة ٣/٣: لون الحبر' : 'Stage 3/3: Ink Color Match'}
        </span>
        <span className="font-mono-tabular text-[#C84B31]">{score} pts</span>
      </div>

      {stage === 'reflex' && (
        <button
          type="button"
          onClick={handleReflexTap}
          className={`w-full h-64 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
            lightState === 'ready'
              ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white'
              : lightState === 'early'
              ? 'bg-[#C84B31] border-[#C84B31] text-white'
              : 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]'
          }`}
        >
          <span className="font-display text-2xl font-bold">
            {lightState === 'waiting'
              ? lang === 'ar' ? 'انتظر اللون الأخضر...' : 'Wait for Green...'
              : lightState === 'ready'
              ? lang === 'ar' ? 'اضغط الآن!' : 'TAP NOW!'
              : lightState === 'early'
              ? lang === 'ar' ? 'مبكر جداً!' : 'Too early!'
              : `${reactionMs} ms`}
          </span>
        </button>
      )}

      {stage === 'targets' && (
        <div className="relative w-full h-64 rounded-3xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] overflow-hidden">
          <p className="pt-3 text-xs text-[#57534E] dark:text-[#B8AFA3] font-mono-tabular">
            {lang === 'ar' ? `المتبقي: ${targetsLeft}` : `Remaining: ${targetsLeft}`}
          </p>
          <button
            type="button"
            onClick={handleTargetClick}
            aria-label="Target"
            style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#C84B31] border-4 border-white shadow-md hover:scale-105 transition-transform cursor-pointer"
          />
        </div>
      )}

      {stage === 'stroop' && (
        <div className="space-y-6 py-4">
          <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">
            {lang === 'ar' ? 'اختر لون الحبر وليس معنى الكلمة:' : 'Select the INK color, not the word:'}
          </p>
          <p className="font-display text-4xl font-extrabold" style={{ color: stroopInk.hex }}>
            {stroopWord[lang]}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {STROOP_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => handleStroopPick(c.key)}
                className="h-12 rounded-xl border border-[#E5DEC9] dark:border-[#342E28] bg-[#FAF8F4] dark:bg-[#25211D] hover:bg-white dark:bg-[#1E1B18] font-semibold text-sm text-[#1C1917] dark:text-[#F5F2EB] tactile-btn cursor-pointer"
              >
                {c[lang]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
