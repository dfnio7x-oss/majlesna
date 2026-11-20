import React from 'react';

/**
 * Subtle repeating SVG line-art pattern showcasing icons from Majlisna's game catalog
 * (XO 3x3 grid, dice, puzzle piece, chess crown, playing cards, paintbrush, target, stopwatch).
 * Positioned fixed behind all views at low opacity so cards and typography remain crisp.
 */
export const GamePatternBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      data-testid="game-pattern-bg"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden text-[#1C1917] dark:text-[#F5F2EB] opacity-[0.045] dark:opacity-[0.055]"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="majlisna-games-tile"
            width="240"
            height="240"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-10)"
          >
            {/* 1. XO 3x3 Mini Grid */}
            <g transform="translate(18, 18)" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round">
              <path d="M10 2V28M20 2V28M2 10H28M2 20H28" opacity="0.55" />
              <path d="M4 4L8 8M8 4L4 8" />
              <circle cx="24" cy="24" r="2.6" />
              <path d="M22 4L26 8M26 4L22 8" />
            </g>

            {/* 2. Dice */}
            <g transform="translate(96, 16)" stroke="currentColor" strokeWidth="1.8" fill="none">
              <rect x="2" y="2" width="24" height="24" rx="5.5" />
              <circle cx="9" cy="9" r="1.4" fill="currentColor" />
              <circle cx="19" cy="9" r="1.4" fill="currentColor" />
              <circle cx="14" cy="14" r="1.4" fill="currentColor" />
              <circle cx="9" cy="19" r="1.4" fill="currentColor" />
              <circle cx="19" cy="19" r="1.4" fill="currentColor" />
            </g>

            {/* 3. Puzzle Piece */}
            <g transform="translate(178, 20)" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round">
              <path d="M4 6H12V9C12 9 15 8 15 10.5C15 13 12 12 12 12V19H22V12C22 12 25 13 25 10.5C25 8 22 9 22 9V6H28V26H4V6Z" />
            </g>

            {/* 4. Crown / Winner */}
            <g transform="translate(32, 96)" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round">
              <path d="M3 21L6 8L13 14L17 5L21 14L28 8L31 21H3Z" />
              <path d="M5 25H29" strokeLinecap="round" />
            </g>

            {/* 5. Memory Playing Cards */}
            <g transform="translate(114, 96)" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round">
              <rect x="2" y="4" width="16" height="22" rx="3" />
              <rect x="11" y="2" width="16" height="22" rx="3" />
              <path d="M19 9L21.5 13L19 17L16.5 13L19 9Z" />
            </g>

            {/* 6. Target / Focus Bullseye */}
            <g transform="translate(186, 98)" stroke="currentColor" strokeWidth="1.8" fill="none">
              <circle cx="14" cy="14" r="12" />
              <circle cx="14" cy="14" r="7" />
              <circle cx="14" cy="14" r="2.2" fill="currentColor" />
            </g>

            {/* 7. Paintbrush / Draw & Guess */}
            <g transform="translate(22, 174)" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 3L27 8L12 23H7V18L22 3Z" />
              <path d="M4 27C8 26 11 23 15 24C19 25 22 22 26 22" />
            </g>

            {/* 8. Stopwatch / Speed Challenge */}
            <g transform="translate(104, 174)" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round">
              <circle cx="14" cy="16" r="11" />
              <path d="M11 2H17M14 2V5M14 16L19 11" />
            </g>

            {/* 9. Lightbulb / Trivia */}
            <g transform="translate(184, 174)" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3C9.6 3 6.5 6.2 6.5 10.2C6.5 13 8 15 10 16.3V19H18V16.3C20 15 21.5 13 21.5 10.2C21.5 6.2 18.4 3 14 3Z" />
              <path d="M10.5 23H17.5M12 26H16" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#majlisna-games-tile)" />
      </svg>
    </div>
  );
};
