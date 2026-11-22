import React, { useMemo, useState } from 'react';
import { Delete } from 'lucide-react';
import type { GameProps } from './GameShell';
import { FIVE_LETTER_WORDS } from '../../data/questionBank';
import { evaluateWordGuess, type LetterStatus } from '../../utils/gameRules';
import { soundEngine } from '../../utils/soundEngine';

const AR_KEYS = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ة'],
  ['ئ', 'ء', 'ؤ', 'ر', 'ى', 'ز', 'و', 'د', 'ذ', 'ط', 'ظ'],
];

const EN_KEYS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const TOTAL_WORD_STAGES = 4;

export const GameGuessWord: React.FC<GameProps> = ({ lang, onFinish, onScoreProgress }) => {
  const stageWords = useMemo(() => {
    const copy = [...FIVE_LETTER_WORDS[lang]];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, TOTAL_WORD_STAGES);
  }, [lang]);

  const [stageIdx, setStageIdx] = useState(0);
  const [guesses, setGuesses] = useState<{ word: string; evals: LetterStatus[] }[]>([]);
  const [current, setCurrent] = useState('');
  const [done, setDone] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [stageBanner, setStageBanner] = useState<string | null>(null);

  const target = stageWords[stageIdx];

  const keyStatuses = useMemo(() => {
    const map = new Map<string, LetterStatus>();
    const rank: Record<LetterStatus, number> = { absent: 0, present: 1, correct: 2 };
    for (const g of guesses) {
      Array.from(g.word).forEach((ch, idx) => {
        const st = g.evals[idx];
        const prev = map.get(ch);
        if (!prev || rank[st] > rank[prev]) map.set(ch, st);
      });
    }
    return map;
  }, [guesses]);

  const handleKey = (ch: string) => {
    if (done || stageBanner || Array.from(current).length >= 5) return;
    soundEngine.playClick();
    setCurrent((prev) => prev + ch);
  };

  const handleBackspace = () => {
    if (done || stageBanner || current.length === 0) return;
    soundEngine.playClick();
    const arr = Array.from(current);
    arr.pop();
    setCurrent(arr.join(''));
  };

  const advanceOrFinish = (wonStage: boolean, nextScore: number, nextSolved: number) => {
    if (stageIdx + 1 >= TOTAL_WORD_STAGES) {
      setDone(true);
      onFinish({
        outcome: nextSolved >= 2 ? 'win' : 'loss',
        score: Math.max(25, nextScore),
        summaryText:
          lang === 'ar'
            ? `أنهيت ${nextSolved} من ${TOTAL_WORD_STAGES} مراحل · الكلمة الأخيرة: ${target}`
            : `Solved ${nextSolved}/${TOTAL_WORD_STAGES} words · Last word: ${target}`,
      });
      return;
    }

    setStageBanner(
      wonStage
        ? lang === 'ar'
          ? `أحسنت! (${target}) — جاري الانتقال للمرحلة ${stageIdx + 2}`
          : `Solved (${target}) — Next stage ${stageIdx + 2}!`
        : lang === 'ar'
        ? `الكلمة كانت: ${target} — جاري الانتقال للمرحلة ${stageIdx + 2}`
        : `Word was: ${target} — Advancing to Stage ${stageIdx + 2}`
    );

    window.setTimeout(() => {
      setStageIdx((s) => s + 1);
      setGuesses([]);
      setCurrent('');
      setStageBanner(null);
    }, 1050);
  };

  const handleSubmit = () => {
    if (done || stageBanner || Array.from(current).length !== 5) {
      soundEngine.playError();
      return;
    }
    const evals = evaluateWordGuess(current, target);
    const nextGuesses = [...guesses, { word: current, evals }];
    setGuesses(nextGuesses);
    setCurrent('');

    const won = evals.every((e) => e === 'correct');
    if (won) {
      soundEngine.playPoint();
      const stageScore = Math.max(35, 110 - (nextGuesses.length - 1) * 14);
      const nextScore = totalScore + stageScore;
      const nextSolved = solvedCount + 1;
      setTotalScore(nextScore);
      setSolvedCount(nextSolved);
      onScoreProgress?.(nextScore);
      advanceOrFinish(true, nextScore, nextSolved);
    } else if (nextGuesses.length >= 6) {
      soundEngine.playError();
      advanceOrFinish(false, totalScore, solvedCount);
    } else {
      soundEngine.playClick();
    }
  };

  const rows = Array.from({ length: 6 });
  const keyboardRows = lang === 'ar' ? AR_KEYS : EN_KEYS;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-xs font-semibold">
        <span className="text-[#57534E] dark:text-[#B8AFA3]">
          {lang === 'ar'
            ? `المرحلة ${stageIdx + 1} / ${TOTAL_WORD_STAGES}`
            : `Stage ${stageIdx + 1} / ${TOTAL_WORD_STAGES}`}
        </span>
        <span className="font-mono-tabular text-[#2D6A4F] dark:text-[#52B788]">
          {totalScore} pts ({solvedCount}/{TOTAL_WORD_STAGES})
        </span>
      </div>

      {stageBanner && (
        <div className="p-2.5 rounded-xl bg-[#D97706]/12 border border-[#D97706]/30 text-center text-xs font-bold text-[#92400E] dark:text-[#FBBF24]">
          {stageBanner}
        </div>
      )}

      <div className="space-y-2 max-w-[310px] mx-auto">
        {rows.map((_, rowIdx) => {
          const submitted = guesses[rowIdx];
          const isCurrent = rowIdx === guesses.length && !done && !stageBanner;
          const letters = submitted
            ? Array.from(submitted.word)
            : isCurrent
            ? Array.from(current)
            : [];

          return (
            <div key={rowIdx} className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((__, colIdx) => {
                const ch = letters[colIdx] ?? '';
                const status = submitted?.evals[colIdx];
                let style = 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB]';
                if (status === 'correct') style = 'bg-[#2D6A4F] border-[#2D6A4F] text-white';
                else if (status === 'present') style = 'bg-[#D97706] border-[#D97706] text-white';
                else if (status === 'absent') style = 'bg-[#57534E] border-[#57534E] text-white';
                else if (ch) style = 'bg-white dark:bg-[#1E1B18] border-[#1C1917] text-[#1C1917] dark:text-[#F5F2EB]';

                return (
                  <div
                    key={colIdx}
                    className={`aspect-square rounded-xl border-2 flex items-center justify-center font-display text-xl font-bold ${style}`}
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Interactive Keyboard */}
      <div className="space-y-1.5 pt-2">
        {keyboardRows.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map((keyChar) => {
              const st = keyStatuses.get(keyChar);
              let cls = 'bg-[#FAF8F4] dark:bg-[#25211D] border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB] hover:bg-[#F1ECE2]';
              if (st === 'correct') cls = 'bg-[#2D6A4F] border-[#2D6A4F] text-white';
              else if (st === 'present') cls = 'bg-[#D97706] border-[#D97706] text-white';
              else if (st === 'absent') cls = 'bg-[#D6CEBF] border-[#D6CEBF] text-[#57534E] dark:text-[#B8AFA3]';

              return (
                <button
                  key={keyChar}
                  type="button"
                  onClick={() => handleKey(keyChar)}
                  className={`min-w-[28px] sm:min-w-[34px] h-10 px-1.5 rounded-lg border text-xs sm:text-sm font-bold cursor-pointer ${cls}`}
                >
                  {keyChar}
                </button>
              );
            })}
          </div>
        ))}
        <div className="flex justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSubmit}
            className="h-10 px-6 rounded-xl bg-[#C84B31] hover:bg-[#B03E26] text-white text-xs sm:text-sm font-semibold tactile-btn cursor-pointer"
          >
            {lang === 'ar' ? 'تحقق' : 'Enter'}
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            aria-label="Backspace"
            className="h-10 px-4 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-center tactile-btn cursor-pointer"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
