import React, { useEffect, useState } from 'react';
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

  const [letter] = useState(() => {
    if (onlineLetter) return onlineLetter;
    const pool = LETTER_CHALLENGE_POOL[lang];
    return pool[Math.floor(Math.random() * pool.length)];
  });

  const [timeLeft, setTimeLeft] = useState(50);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const activeLetter = onlineLetter || letter;

  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [timeLeft, submitted]);

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    const cleanTargetChar = activeLetter.replace('ـ', '').charAt(0).toLowerCase();
    let total = 0;
    let validCount = 0;

    CATEGORIES.forEach((cat) => {
      const val = (answers[cat.key] ?? '').trim();
      if (val.length >= 2) {
        const first = val.charAt(0).toLowerCase();
        const matches =
          first === cleanTargetChar ||
          (cleanTargetChar === 'أ' && ['ا', 'إ', 'آ'].includes(first));
        total += matches ? 20 : 8;
        if (matches) validCount++;
      }
    });

    soundEngine.playPoint();
    onScoreProgress?.(total);
    onFinish({
      outcome: validCount >= 3 ? 'win' : 'draw',
      score: total,
      summaryText:
        lang === 'ar'
          ? `حرف "${activeLetter}" · ${validCount} فئات مطابقة للحرف`
          : `Letter "${activeLetter}" · ${validCount}/5 matching entries`,
    });
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
              {lang === 'ar' ? 'اكتب كلمات تبدأ بهذا الحرف' : 'Fill words starting with this letter'}
            </p>
            <p className="text-sm font-bold text-[#1C1917] dark:text-[#F5F2EB]">
              {lang === 'ar' ? 'إنسان · حيوان · نبات · جماد · بلاد' : 'Person · Animal · Plant · Object · Country'}
            </p>
          </div>
        </div>
        <span className="font-mono-tabular text-lg font-bold text-[#C84B31]">{timeLeft}s</span>
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
        {lang === 'ar' ? 'تثبيت الإجابات' : 'Submit Answers'}
      </button>
    </div>
  );
};
