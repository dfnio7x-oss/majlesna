import React, { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import type { GameProps } from './GameShell';
import { CHARACTER_PUZZLES } from '../../data/questionBank';
import { soundEngine } from '../../utils/soundEngine';

export const GameGuessCharacter: React.FC<GameProps> = ({
  lang,
  onFinish,
  onScoreProgress,
}) => {
  const puzzles = useMemo(() => {
    const copy = [...CHARACTER_PUZZLES];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 8);
  }, []);

  const [roundIdx, setRoundIdx] = useState(0);
  const [cluesShown, setCluesShown] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);

  const puzzle = puzzles[roundIdx];

  const handleGuess = (name: string) => {
    if (selected) return;
    setSelected(name);
    const isCorrect = name === puzzle.answer[lang];
    let nextScore = score;
    let nextSolved = solved;

    if (isCorrect) {
      soundEngine.playPoint();
      const gained = Math.max(15, 45 - (cluesShown - 1) * 7);
      nextScore += gained;
      nextSolved += 1;
      setScore(nextScore);
      setSolved(nextSolved);
      onScoreProgress?.(nextScore);
    } else {
      soundEngine.playError();
    }

    window.setTimeout(() => {
      if (roundIdx + 1 >= puzzles.length) {
        onFinish({
          outcome: nextSolved >= 4 ? 'win' : 'loss',
          score: nextScore,
          summaryText:
            lang === 'ar'
              ? `عرفت ${nextSolved} من أصل ${puzzles.length} شخصيات`
              : `Identified ${nextSolved} of ${puzzles.length} figures`,
        });
      } else {
        setRoundIdx((r) => r + 1);
        setCluesShown(1);
        setSelected(null);
      }
    }, 950);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-2">
      <div className="flex items-center justify-between text-xs font-semibold text-[#57534E] dark:text-[#B8AFA3]">
        <span className="font-mono-tabular">
          {lang === 'ar' ? `الشخصية ${roundIdx + 1} / ${puzzles.length}` : `Figure ${roundIdx + 1} / ${puzzles.length}`}
        </span>
        <span className="font-mono-tabular text-[#7C3AED]">{score} pts</span>
      </div>

      <div className="space-y-2.5">
        {puzzle.clues[lang].slice(0, cluesShown).map((clue, i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#25211D] border border-[#E5DEC9] dark:border-[#342E28] text-sm text-[#1C1917] dark:text-[#F5F2EB] flex items-start gap-2.5"
          >
            <span className="font-mono-tabular text-xs font-bold text-[#7C3AED] pt-0.5">
              0{i + 1}
            </span>
            <span>{clue}</span>
          </div>
        ))}
      </div>

      {cluesShown < 5 && !selected && (
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setCluesShown((c) => Math.min(5, c + 1));
          }}
          className="h-9 px-4 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-xs font-semibold text-[#7C3AED] flex items-center gap-1.5 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>
            {lang === 'ar'
              ? `كشف تلميح إضافي (${cluesShown}/5)`
              : `Reveal Next Clue (${cluesShown}/5)`}
          </span>
        </button>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2">
        {puzzle.options[lang].map((opt) => {
          let cls = 'bg-white dark:bg-[#1E1B18] border-[#E5DEC9] dark:border-[#342E28] hover:border-[#7C3AED] text-[#1C1917] dark:text-[#F5F2EB]';
          if (selected) {
            if (opt === puzzle.answer[lang]) cls = 'bg-[#2D6A4F] border-[#2D6A4F] text-white';
            else if (opt === selected) cls = 'bg-[#C84B31] border-[#C84B31] text-white';
          }
          return (
            <button
              key={opt}
              type="button"
              disabled={Boolean(selected)}
              onClick={() => handleGuess(opt)}
              className={`p-3.5 rounded-xl border-2 text-sm font-semibold tactile-btn cursor-pointer ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
