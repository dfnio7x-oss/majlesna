import React, { useEffect, useMemo, useState } from 'react';
import type { GameProps } from './GameShell';
import { LETTER_CHALLENGE_POOL } from '../../data/questionBank';
import { soundEngine } from '../../utils/soundEngine';

const CATEGORIES = [
  { key: 'person', ar: 'إنسان', en: 'Person / Name' },
  { key: 'animal', ar: 'حيوان', en: 'Animal' },
  { key: 'plant', ar: 'نبات', en: 'Plant / Food' },
  { key: 'object', ar: 'جماد', en: 'Object' },
  { key: 'country', ar: 'بلاد', en: 'Country / City' },
];

const LOCAL_LETTER_STAGES = 5;

export const GameLetterChallenge: React.FC<GameProps> = ({
  lang,
  mode,
  room,
  onFinish,
  onScoreProgress,
}) => {
  const onlineLetter =
    mode === 'online' && room
      ? lang === 'ar'
        ? (room.gameState.arLetter as string)
        : (room.gameState.enLetter as string)
      : null;

  const letterSequence = useMemo(() => {
    const copy = [...LETTER_CHALLENGE_POOL[lang]];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, LOCAL_LETTER_STAGES);
  }, [lang]);

  const [stageIdx, setStageIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(50);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [totalValid, setTotalValid] = useState(0);

  const activeLetter = onlineLetter || letterSequence[stageIdx];
  const isOnline = mode === 'online';

  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [timeLeft, submitted, stageIdx]);

  const handleSubmit = () => {
    if (submitted) return;
    const cleanTargetChar = activeLetter.replace('ـ', '').charAt(0).toLowerCase();
    let roundTotal = 0;
    let validCount = 0;

    CATEGORIES.forEach((cat) => {
      const val = (answers[cat.key] ?? '').trim();
      if (val.length >= 2) {
        const first = val.charAt(0).toLowerCase();
        const matches =
          first === cleanTargetChar ||
          (cleanTargetChar === 'أ' && ['ا', 'إ', 'آ'].includes(first));
        roundTotal += matches ? 20 : 8;
        if (matches) validCount++;
      }
    });

    const nextScore = totalScore + roundTotal;
    const nextValid = totalValid + validCount;
    setTotalScore(nextScore);
    setTotalValid(nextValid);
    soundEngine.playPoint();
    onScoreProgress?.(nextScore);

    if (isOnline || stageIdx + 1 >= LOCAL_LETTER_STAGES) {
      setSubmitted(true);
      onFinish({
        outcome: isOnline
          ? validCount >= 3 ? 'win' : 'draw'
          : nextValid >= 12 ? 'win' : 'draw',
        score: nextScore,
        summaryText: isOnline
          ? lang === 'ar'
            ? `حرف "${activeLetter}" · ${validCount} فئات مطابقة للحرف`
            : `Letter "${activeLetter}" · ${validCount}/5 matching entries`
          : lang === 'ar'
          ? `أنهيت ماراثون ٥ حروف · ${nextValid} إجابات مطابقة`
          : `5-letter marathon · ${nextValid}/25 matching entries`,
      });
    } else {
      setStageIdx((s) => s + 1);
      setAnswers({});
      setTimeLeft(50);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#B45309] text-white font-display text-2xl font-bold flex items-center justify-center">
            {activeLetter}
          </div>
          <div>
            <p className="text-xs text-[#57534E] dark:text-[#B8AFA3]">
              {!isOnline && (
                <span className="font-bold text-[#C84B31] me-1.5">
                  {lang === 'ar'
                    ? `الحرف ${stageIdx + 1}/${LOCAL_LETTER_STAGES} ·`
                    : `Letter ${stageIdx + 1}/${LOCAL_LETTER_STAGES} ·`}
                </span>
              )}
              {lang === 'ar' ? 'اكتب كلمات تبدأ بهذا الحرف' : 'Fill words starting with this letter'}
            </p>
            <p className="text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB]">
              {lang === 'ar' ? 'إنسان · حيوان · نبات · جماد · بلاد' : 'Person · Animal · Plant · Object · Country'}
            </p>
          </div>
        </div>
        <div className="text-end">
          <span className="font-mono-tabular text-lg font-bold text-[#C84B31] block">{timeLeft}s</span>
          {!isOnline && (
            <span className="font-mono-tabular text-[11px] font-bold text-[#2D6A4F]">{totalScore} pts</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="space-y-1">
            <label htmlFor={`cat-${cat.key}`} className="block text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
              {cat[lang]}
            </label>
            <input
              id={`cat-${cat.key}`}
              type="text"
              value={answers[cat.key] ?? ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [cat.key]: e.target.value }))}
              placeholder={`${activeLetter}...`}
              className="w-full h-10 px-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#B45309]"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full h-11 rounded-xl bg-[#B45309] hover:bg-[#92400E] text-white text-sm font-semibold tactile-btn cursor-pointer"
      >
        {!isOnline && stageIdx + 1 < LOCAL_LETTER_STAGES
          ? lang === 'ar' ? 'اعتماد والانتقال للحرف التالي' : 'Submit & Next Letter'
          : lang === 'ar' ? 'تثبيت الإجابات' : 'Submit Answers'}
      </button>
    </div>
  );
};
