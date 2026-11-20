import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, UserPlus } from 'lucide-react';

export interface ToastNotice {
  id: string;
  kind: 'points' | 'join' | 'info';
  text: string;
}

export const ToastStack: React.FC<{ toasts: ToastNotice[] }> = ({ toasts }) => (
  <div
    className="fixed bottom-24 start-4 sm:start-5 z-50 flex flex-col gap-2 pointer-events-none"
    aria-live="polite"
  >
    <AnimatePresence>
      {toasts.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.94 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#1C1917] text-[#FAF8F4] text-sm font-medium shadow-lg border border-white/10"
        >
          {item.kind === 'points' ? (
            <Sparkles className="w-4 h-4 text-[#FBBF24] shrink-0" />
          ) : (
            <UserPlus className="w-4 h-4 text-[#34D399] shrink-0" />
          )}
          <span className="tabular-nums">{item.text}</span>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

const CONFETTI_PIECES = [
  { x: -120, y: -90, r: -25, color: '#C84B31', delay: 0 },
  { x: -75, y: -125, r: 40, color: '#2D6A4F', delay: 0.04 },
  { x: -30, y: -110, r: -15, color: '#D97706', delay: 0.08 },
  { x: 28, y: -130, r: 22, color: '#2B4C7E', delay: 0.03 },
  { x: 80, y: -105, r: -42, color: '#C84B31', delay: 0.07 },
  { x: 125, y: -85, r: 30, color: '#2D6A4F', delay: 0.05 },
  { x: -95, y: -45, r: 60, color: '#D97706', delay: 0.09 },
  { x: 95, y: -40, r: -55, color: '#2B4C7E', delay: 0.06 },
];

export const OutcomeCelebration: React.FC<{ outcome: 'win' | 'loss' | 'draw' }> = ({ outcome }) => {
  if (outcome === 'win') {
    return (
      <div className="relative h-16 flex items-center justify-center overflow-visible" aria-hidden="true">
        {CONFETTI_PIECES.map((p, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: 0, x: 0, y: 10, rotate: 0, scale: 0.4 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: p.x,
              y: p.y,
              rotate: p.r,
              scale: [0.4, 1.15, 0.9],
            }}
            transition={{ duration: 1.15, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
            className="absolute w-3 h-3 rounded-sm"
            style={{ backgroundColor: p.color }}
          />
        ))}
        <motion.div
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          className="w-16 h-16 rounded-2xl bg-[#2D6A4F]/15 border border-[#2D6A4F]/30 flex items-center justify-center"
        >
          <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
            <path
              d="M11 8H25V16C25 20.4 21.9 23.5 18 23.5C14.1 23.5 11 20.4 11 16V8Z"
              fill="#D97706"
              fillOpacity="0.28"
              stroke="#D97706"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path d="M11 11H7.5C7.5 14.5 9 16.5 11 17M25 11H28.5C28.5 14.5 27 16.5 25 17" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 23.5V28.5M13 29H23" stroke="#1C1917" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>
    );
  }

  if (outcome === 'draw') {
    return (
      <div className="h-16 flex items-center justify-center" aria-hidden="true">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-16 h-16 rounded-2xl bg-[#2B4C7E]/12 border border-[#2B4C7E]/25 flex items-center justify-center"
        >
          <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
            <path d="M9 14H27M9 22H27" stroke="#2B4C7E" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-16 flex items-center justify-center" aria-hidden="true">
      <motion.div
        initial={{ y: -6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-16 h-16 rounded-2xl bg-[#C84B31]/10 border border-[#C84B31]/20 flex items-center justify-center"
      >
        <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none">
          <circle cx="18" cy="18" r="10" stroke="#C84B31" strokeWidth="2.2" />
          <path d="M14 22C15.5 20 20.5 20 22 22" stroke="#C84B31" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="14.5" cy="15.5" r="1.4" fill="#1C1917" />
          <circle cx="21.5" cy="15.5" r="1.4" fill="#1C1917" />
        </svg>
      </motion.div>
    </div>
  );
};
