import React from 'react';
import type { GameId } from '../../types/game';

export const MajlisnaLogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <img
    src="/logo-majlisna.png"
    alt="مجلسنا"
    className={`object-contain shrink-0 select-none ${className}`}
    draggable={false}
  />
);

export const DiwanLogo = MajlisnaLogo;

export const GameIcon: React.FC<{
  gameId: GameId;
  className?: string;
  accent?: string;
}> = ({ gameId, className = 'w-10 h-10', accent = '#C84B31' }) => {
  switch (gameId) {
    case 'xo':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <path d="M15 8V32M25 8V32M8 15H32M8 25H32" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M10 10L13.8 13.8M13.8 10L10 13.8" stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="28.2" cy="28.2" r="2.8" stroke="#2D6A4F" strokeWidth="2.4" />
          <path d="M26.2 10L30 13.8M30 10L26.2 13.8" stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'rps':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#2D6A4F" fillOpacity="0.14" />
          <circle cx="13.5" cy="24" r="5.5" fill="#2D6A4F" fillOpacity="0.24" stroke="#2D6A4F" strokeWidth="2" />
          <rect x="19" y="10" width="9" height="11" rx="2" fill="#FAF8F4" stroke="#1C1917" strokeWidth="2" />
          <path d="M21 29L27 23M21 23L27 29" stroke="#C84B31" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'number-guess':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#2B4C7E" fillOpacity="0.14" />
          <rect x="9" y="11" width="22" height="18" rx="4.5" fill="#FAF8F4" stroke="#2B4C7E" strokeWidth="2" />
          <path d="M15 24V16L13 18" stroke="#2B4C7E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 17.5C22 16.2 23.1 15.3 24.5 15.3C25.8 15.3 26.8 16.1 26.8 17.3C26.8 18.7 24.5 19.3 24.5 21" stroke="#C84B31" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="24.5" cy="24" r="1.2" fill="#C84B31" />
        </svg>
      );
    case 'millionaire':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#D97706" fillOpacity="0.16" />
          <path d="M20 7L32 20L20 33L8 20L20 7Z" fill="#D97706" fillOpacity="0.22" stroke="#D97706" strokeWidth="2" strokeLinejoin="round" />
          <path d="M20 12L27 20L20 28L13 20L20 12Z" stroke="#1C1917" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="20" cy="20" r="2.6" fill="#D97706" />
        </svg>
      );
    case 'trivia':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#2B4C7E" fillOpacity="0.14" />
          <path d="M20 9C15 9 11.5 12.6 11.5 17C11.5 20 13.1 22.3 15.4 23.6V26.5H24.6V23.6C26.9 22.3 28.5 20 28.5 17C28.5 12.6 25 9 20 9Z" fill="#FEF3C7" stroke="#2B4C7E" strokeWidth="2" strokeLinejoin="round" />
          <path d="M16 30H24M17.5 33H22.5" stroke="#2B4C7E" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 14V19M17.5 16.5H22.5" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'guess-character':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#7C3AED" fillOpacity="0.14" />
          <circle cx="19" cy="15.5" r="5" fill="#7C3AED" fillOpacity="0.22" stroke="#7C3AED" strokeWidth="2" />
          <path d="M10.5 30C11.5 25 14.8 22.5 19 22.5C23.2 22.5 26.5 25 27.5 30" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
          <circle cx="28.5" cy="13.5" r="4" fill="#FAF8F4" stroke="#1C1917" strokeWidth="1.8" />
          <path d="M31.5 16.5L34 19" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'guess-word':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#2D6A4F" fillOpacity="0.14" />
          <rect x="8" y="10" width="10" height="10" rx="2.5" fill="#2D6A4F" />
          <rect x="22" y="10" width="10" height="10" rx="2.5" fill="#D97706" />
          <rect x="8" y="22" width="10" height="10" rx="2.5" fill="#FAF8F4" stroke="#1C1917" strokeOpacity="0.25" strokeWidth="1.6" />
          <rect x="22" y="22" width="10" height="10" rx="2.5" fill="#2D6A4F" />
        </svg>
      );
    case 'memory':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#C84B31" fillOpacity="0.14" />
          <rect x="8" y="11" width="14" height="19" rx="3.5" fill="#FAF8F4" stroke="#1C1917" strokeWidth="1.9" />
          <rect x="18" y="9" width="14" height="19" rx="3.5" fill="#C84B31" fillOpacity="0.2" stroke="#C84B31" strokeWidth="1.9" />
          <path d="M25 14L27.5 18.5L25 23L22.5 18.5L25 14Z" fill="#C84B31" />
        </svg>
      );
    case 'speed-challenge':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#DC2626" fillOpacity="0.14" />
          <circle cx="20" cy="21" r="10.5" fill="#FAF8F4" stroke="#1C1917" strokeWidth="2" />
          <path d="M17 8H23M20 8V10.5M20 21L25.5 15.5" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="20" cy="21" r="2" fill="#DC2626" />
        </svg>
      );
    case 'qa-duel':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#0F766E" fillOpacity="0.14" />
          <path d="M8 11H24V22H15L10 26V22H8V11Z" fill="#FAF8F4" stroke="#0F766E" strokeWidth="2" strokeLinejoin="round" />
          <path d="M17 17H32V27H29V31L24 27H17V17Z" fill="#0F766E" fillOpacity="0.2" stroke="#1C1917" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case 'math-challenge':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#2B4C7E" fillOpacity="0.14" />
          <path d="M13 11V19M9 15H17" stroke="#2B4C7E" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M23 15H31" stroke="#C84B31" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M10.5 23.5L15.5 28.5M15.5 23.5L10.5 28.5" stroke="#1C1917" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M23 24H31M23 28H31" stroke="#2D6A4F" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'word-order':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#D97706" fillOpacity="0.15" />
          <rect x="8" y="10" width="10" height="9" rx="2" fill="#FAF8F4" stroke="#D97706" strokeWidth="1.9" />
          <rect x="22" y="10" width="10" height="9" rx="2" fill="#D97706" fillOpacity="0.25" stroke="#D97706" strokeWidth="1.9" />
          <rect x="14" y="22" width="12" height="9" rx="2" fill="#FAF8F4" stroke="#1C1917" strokeWidth="1.9" />
        </svg>
      );
    case 'true-false':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#2D6A4F" fillOpacity="0.14" />
          <circle cx="14.5" cy="20" r="7" fill="#2D6A4F" fillOpacity="0.18" stroke="#2D6A4F" strokeWidth="2" />
          <path d="M11.5 20L13.7 22.2L17.8 18" stroke="#2D6A4F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="26.5" cy="20" r="6.5" fill="#C84B31" fillOpacity="0.15" stroke="#C84B31" strokeWidth="2" />
          <path d="M24 17.5L29 22.5M29 17.5L24 22.5" stroke="#C84B31" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'draw-guess':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#C84B31" fillOpacity="0.14" />
          <path d="M10 29C14 27 16 21 21 20C25 19 27 25 31 23" stroke="#2D6A4F" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M23.5 9.5L30.5 16.5L18 29H11V22L23.5 9.5Z" fill="#FAF8F4" stroke="#C84B31" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 'letter-challenge':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#B45309" fillOpacity="0.15" />
          <circle cx="20" cy="20" r="11" fill="#FAF8F4" stroke="#B45309" strokeWidth="2" />
          <path d="M16.5 25L20 14L23.5 25M17.8 22H22.2" stroke="#1C1917" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'mafia':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#991B1B" fillOpacity="0.14" />
          <path d="M8 18H32" stroke="#1C1917" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M13 18L15.5 10.5H24.5L27 18" fill="#1C1917" fillOpacity="0.88" />
          <path d="M11 23.5C13.5 22 16 22 18 24.5M22 24.5C24 22 26.5 22 29 23.5" stroke="#991B1B" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'riddles':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill="#4338CA" fillOpacity="0.14" />
          <path d="M13 11H21V15C21 15 24 14 24 16.5C24 19 21 18 21 18V22H17C17 22 18 25 15.5 25C13 25 14 22 14 22H10V14C10 12.3 11.3 11 13 11Z" fill="#4338CA" fillOpacity="0.2" stroke="#4338CA" strokeWidth="1.9" strokeLinejoin="round" />
          <circle cx="27.5" cy="27.5" r="4.5" fill="#FAF8F4" stroke="#1C1917" strokeWidth="1.9" />
          <path d="M27.5 25.5V29.5M25.5 27.5H29.5" stroke="#4338CA" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    // ===== PHASE 2: 40 BESPOKE GAME ICONS =====
    case 'sudoku-party':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="9" y="9" width="22" height="22" rx="3" fill="#FAF8F4" stroke={accent} strokeWidth="2" />
          <path d="M20 9V31M9 20H31" stroke={accent} strokeWidth="2" />
          <path d="M14.5 9V31M25.5 9V31M9 14.5H31M9 25.5H31" stroke={accent} strokeOpacity="0.28" strokeWidth="1.2" />
          <circle cx="14.5" cy="14.5" r="1.5" fill={accent} />
          <circle cx="25.5" cy="25.5" r="1.5" fill="#C84B31" />
        </svg>
      );
    case 'solve-puzzle':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="9" y="10" width="22" height="20" rx="3.5" fill="#FAF8F4" stroke={accent} strokeWidth="2" />
          <path d="M16 10V30M23 10V30M9 17H31M9 23.5H31" stroke={accent} strokeOpacity="0.35" strokeWidth="1.4" />
          <path d="M18 19.5L20 21.5L23.5 18" stroke="#2D6A4F" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'spot-differences':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="7" y="11" width="11" height="18" rx="2.5" fill="#FAF8F4" stroke={accent} strokeWidth="1.9" />
          <rect x="22" y="11" width="11" height="18" rx="2.5" fill="#FAF8F4" stroke={accent} strokeWidth="1.9" />
          <circle cx="12.5" cy="17" r="2.2" fill={accent} />
          <path d="M25.5 15L29.5 19M29.5 15L25.5 19" stroke="#C84B31" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'complete-pattern':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <circle cx="12" cy="20" r="3.5" fill={accent} />
          <path d="M20 16L24 23.5H16L20 16Z" fill="#D97706" />
          <rect x="26" y="16" width="7" height="7" rx="1.5" stroke={accent} strokeWidth="2" strokeDasharray="2 2" />
        </svg>
      );
    case 'number-ordering':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="9" y="9" width="10" height="10" rx="2.5" fill="#FAF8F4" stroke={accent} strokeWidth="1.9" />
          <rect x="21" y="9" width="10" height="10" rx="2.5" fill={accent} fillOpacity="0.25" stroke={accent} strokeWidth="1.9" />
          <rect x="9" y="21" width="10" height="10" rx="2.5" fill={accent} fillOpacity="0.25" stroke={accent} strokeWidth="1.9" />
          <rect x="21" y="21" width="10" height="10" rx="2.5" stroke={accent} strokeOpacity="0.4" strokeDasharray="2.5 2" strokeWidth="1.6" />
        </svg>
      );
    case 'crack-code':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="11" y="18" width="18" height="13" rx="3.5" fill="#FAF8F4" stroke={accent} strokeWidth="2" />
          <path d="M15 18V14C15 11.2 17.2 9 20 9C22.8 9 25 11.2 25 14V18" stroke={accent} strokeWidth="2.2" />
          <circle cx="16" cy="24.5" r="1.5" fill={accent} />
          <circle cx="20" cy="24.5" r="1.5" fill="#2D6A4F" />
          <circle cx="24" cy="24.5" r="1.5" fill="#D97706" />
        </svg>
      );
    case 'strongest-memory':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="9" y="9" width="9" height="9" rx="2.5" fill="#C84B31" />
          <rect x="22" y="9" width="9" height="9" rx="2.5" fill="#2D6A4F" />
          <rect x="9" y="22" width="9" height="9" rx="2.5" fill="#2B4C7E" />
          <rect x="22" y="22" width="9" height="9" rx="2.5" fill="#D97706" />
        </svg>
      );
    case 'crossword-challenge':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="9" y="9" width="22" height="22" rx="3" fill="#FAF8F4" stroke={accent} strokeWidth="2" />
          <rect x="16.5" y="16.5" width="7" height="7" fill={accent} />
          <path d="M16.5 9V31M23.5 9V31M9 16.5H31M9 23.5H31" stroke={accent} strokeWidth="1.5" />
        </svg>
      );
    case 'hidden-word':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="8" y="14" width="24" height="8" rx="4" fill={accent} fillOpacity="0.22" stroke={accent} strokeWidth="1.8" />
          <circle cx="13" cy="18" r="1.6" fill={accent} />
          <circle cx="20" cy="18" r="1.6" fill={accent} />
          <circle cx="27" cy="18" r="1.6" fill={accent} />
          <path d="M12 27H28" stroke="#1C1917" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'image-puzzle':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="9" y="10" width="22" height="20" rx="3.5" fill="#FAF8F4" stroke={accent} strokeWidth="2" />
          <path d="M11 26L16.5 19.5L21 24L24.5 20.5L29 26H11Z" fill={accent} fillOpacity="0.32" />
          <rect x="20" y="10" width="11" height="10" fill={accent} />
        </svg>
      );
    case 'fastest-answer':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="9" y="25" width="22" height="6" rx="2.5" fill="#1C1917" />
          <path d="M13 25C13 18.5 16 14 20 14C24 14 27 18.5 27 25H13Z" fill={accent} />
          <path d="M20 7V11M11 11L13.5 13.5M29 11L26.5 13.5" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'perfect-timing':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="7" y="17" width="26" height="6" rx="3" fill="#FAF8F4" stroke="#1C1917" strokeWidth="1.8" />
          <rect x="17" y="17" width="6" height="6" fill="#2D6A4F" />
          <path d="M20 11V29" stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'reaction-duel':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <path d="M22 8L12 22H20L18 32L28 18H20L22 8Z" fill={accent} stroke="#1C1917" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case 'typing-race':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="7" y="12" width="26" height="16" rx="3.5" fill="#FAF8F4" stroke={accent} strokeWidth="2" />
          <path d="M12 17H15M18 17H22M25 17H28M14 23H26" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'focus-challenge':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <circle cx="20" cy="20" r="10" stroke={accent} strokeWidth="2" />
          <circle cx="20" cy="20" r="5" stroke={accent} strokeWidth="2" />
          <circle cx="20" cy="20" r="2" fill="#C84B31" />
        </svg>
      );
    case 'fast-counting':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <circle cx="13" cy="14" r="3" fill={accent} />
          <circle cx="25" cy="13" r="3" fill="#D97706" />
          <circle cx="19" cy="22" r="3" fill={accent} />
          <circle cx="27" cy="25" r="3" fill={accent} />
          <circle cx="12" cy="26" r="2.5" fill="#2B4C7E" />
        </svg>
      );
    case 'odd-one-out':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <circle cx="14" cy="14" r="4" fill={accent} fillOpacity="0.3" stroke={accent} strokeWidth="1.8" />
          <circle cx="26" cy="14" r="4" fill={accent} fillOpacity="0.3" stroke={accent} strokeWidth="1.8" />
          <circle cx="14" cy="26" r="4" fill={accent} fillOpacity="0.3" stroke={accent} strokeWidth="1.8" />
          <path d="M26 21.5L30 29.5H22L26 21.5Z" fill="#C84B31" />
        </svg>
      );
    case 'mental-math':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <path d="M10 20H16M13 17V23M20 20H24M27 16L31 24M23 11L19 29" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'letter-arrange':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="8" y="13" width="8" height="12" rx="2" fill="#FAF8F4" stroke={accent} strokeWidth="1.8" />
          <rect x="16" y="11" width="8" height="12" rx="2" fill={accent} fillOpacity="0.25" stroke={accent} strokeWidth="1.8" />
          <rect x="24" y="15" width="8" height="12" rx="2" fill="#FAF8F4" stroke={accent} strokeWidth="1.8" />
        </svg>
      );
    case 'rapid-questions':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <path d="M10 14H28M10 20H23M10 26H19" stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M28 21L25 27H29L27 32L32 25H28L28 21Z" fill="#D97706" />
        </svg>
      );
    case 'secret-agent':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <circle cx="15" cy="21" r="4.5" fill="#1C1917" />
          <circle cx="25" cy="21" r="4.5" fill="#1C1917" />
          <path d="M19.5 21H20.5M9 19L11 14H29L31 19" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'whos-liar':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <circle cx="14" cy="18" r="4.5" fill="#2D6A4F" fillOpacity="0.25" stroke="#2D6A4F" strokeWidth="1.9" />
          <circle cx="26" cy="18" r="4.5" fill={accent} fillOpacity="0.25" stroke={accent} strokeWidth="1.9" />
          <path d="M12 28C14 25 18 25 20 28M22 28C24 25 28 25 30 28" stroke="#1C1917" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'forbidden-word':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <circle cx="20" cy="20" r="10.5" fill="#FAF8F4" stroke={accent} strokeWidth="2.2" />
          <path d="M12.5 27.5L27.5 12.5" stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'who-am-i':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="10" y="10" width="20" height="14" rx="3" fill="#FAF8F4" stroke={accent} strokeWidth="2" />
          <path d="M18 15C18 13.8 18.9 13 20 13C21.1 13 22 13.8 22 14.8C22 16 20 16.5 20 18" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="20.8" r="1" fill={accent} />
          <path d="M13 30C15 26.5 25 26.5 27 30" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'two-truths-lie':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <path d="M11 13L13.5 15.5L17.5 11.5" stroke="#2D6A4F" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M11 21L13.5 23.5L17.5 19.5" stroke="#2D6A4F" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M11.5 27L16.5 31M16.5 27L11.5 31" stroke="#C84B31" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M21 13.5H30M21 21.5H30M21 29H30" stroke="#1C1917" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'guess-author':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <path d="M9 11H31V24H21L15 29V24H9V11Z" fill="#FAF8F4" stroke={accent} strokeWidth="2" strokeLinejoin="round" />
          <path d="M15 17H25" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'weird-translator':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="8" y="10" width="13" height="12" rx="2.5" fill="#FAF8F4" stroke={accent} strokeWidth="1.9" />
          <rect x="19" y="18" width="13" height="12" rx="2.5" fill={accent} fillOpacity="0.22" stroke={accent} strokeWidth="1.9" />
          <path d="M12 16H17M23 24H28" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'finish-story':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <path d="M10 10H23C25 10 26 11.5 26 13.5V29C24 27.5 21 27.5 19 29H10V10Z" fill="#FAF8F4" stroke={accent} strokeWidth="1.9" />
          <path d="M14 16H22M14 21H20M28 19L32 15L34 17L30 21H28V19Z" stroke="#C84B31" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'would-you-rather':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="8" y="12" width="10" height="16" rx="2.5" fill={accent} fillOpacity="0.22" stroke={accent} strokeWidth="1.9" />
          <rect x="22" y="12" width="10" height="16" rx="2.5" fill="#2B4C7E" fillOpacity="0.22" stroke="#2B4C7E" strokeWidth="1.9" />
          <path d="M20 9V31" stroke="#1C1917" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );
    case 'secret-vote':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="9" y="18" width="22" height="13" rx="3" fill="#FAF8F4" stroke={accent} strokeWidth="2" />
          <path d="M15 18L19 10H27L24 18" fill={accent} fillOpacity="0.22" stroke={accent} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M14 22H26" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'sketch-relay':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <circle cx="19" cy="20" r="10" fill="#FAF8F4" stroke={accent} strokeWidth="2" />
          <circle cx="15" cy="17" r="2" fill="#C84B31" />
          <circle cx="22" cy="15" r="2" fill="#2D6A4F" />
          <circle cx="24" cy="22" r="2" fill="#D97706" />
          <circle cx="16" cy="24" r="2" fill="#2B4C7E" />
        </svg>
      );
    case 'guess-song':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <path d="M16 26V13L29 10V23" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="13.5" cy="26.5" r="3" fill={accent} />
          <circle cx="26.5" cy="23.5" r="3" fill={accent} />
        </svg>
      );
    case 'movie-emoji':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="9" y="15" width="22" height="14" rx="2.5" fill="#FAF8F4" stroke="#1C1917" strokeWidth="2" />
          <path d="M9 15L12 10L31 10L29 15" fill={accent} fillOpacity="0.25" stroke="#1C1917" strokeWidth="1.8" />
          <circle cx="20" cy="22" r="3" fill={accent} />
        </svg>
      );
    case 'emoji-challenge':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <circle cx="20" cy="20" r="10.5" fill="#FEF3C7" stroke={accent} strokeWidth="2" />
          <circle cx="16.5" cy="18" r="1.4" fill="#1C1917" />
          <circle cx="23.5" cy="18" r="1.4" fill="#1C1917" />
          <path d="M16 22.5C17.5 24.8 22.5 24.8 24 22.5" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'random-story':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="9" y="13" width="12" height="12" rx="3" fill="#FAF8F4" stroke={accent} strokeWidth="1.9" />
          <rect x="19" y="17" width="12" height="12" rx="3" fill={accent} fillOpacity="0.22" stroke={accent} strokeWidth="1.9" />
          <circle cx="15" cy="19" r="1.6" fill={accent} />
          <circle cx="23" cy="21" r="1.4" fill={accent} />
          <circle cx="27" cy="25" r="1.4" fill={accent} />
        </svg>
      );
    case 'acting-challenge':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <path d="M10 12H23V22C23 25.5 19.5 28 16.5 28C13.5 28 10 25.5 10 22V12Z" fill="#FAF8F4" stroke={accent} strokeWidth="2" />
          <path d="M17 16H30V26C30 29.5 26.5 32 23.5 32C20.5 32 17 29.5 17 26V16Z" fill={accent} fillOpacity="0.22" stroke="#1C1917" strokeWidth="1.8" />
        </svg>
      );
    case 'shadow-guess':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <path d="M13 28C13 21 16 14 20 11C24 14 27 21 27 28H13Z" fill="#1C1917" />
          <circle cx="20" cy="12" r="3.5" fill="#1C1917" />
        </svg>
      );
    case 'sound-imitation':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="16" y="10" width="8" height="13" rx="4" fill={accent} fillOpacity="0.24" stroke={accent} strokeWidth="2" />
          <path d="M12 20C12 24.5 15.6 28 20 28C24.4 28 28 24.5 28 20M20 28V32M16 32H24" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'jigsaw-assembly':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <path d="M10 12H18V16C18 16 21 15 21 17.5C21 20 18 19 18 19V27H10V12Z" fill={accent} fillOpacity="0.25" stroke={accent} strokeWidth="1.9" />
          <path d="M21 12H30V27H21V21" stroke={accent} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'word-chain':
      return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="34" height="34" rx="9" fill={accent} fillOpacity="0.14" />
          <rect x="8" y="15" width="13" height="9" rx="4.5" stroke={accent} strokeWidth="2.2" />
          <rect x="19" y="16" width="13" height="9" rx="4.5" stroke="#C84B31" strokeWidth="2.2" />
        </svg>
      );
  }
};

export const AVATAR_COUNT = 12;

export const AvatarSvg: React.FC<{
  avatarId: number;
  customAvatarUrl?: string | null;
  accentColor?: string;
  size?: number;
  className?: string;
}> = ({ avatarId, customAvatarUrl, accentColor = '#C84B31', size = 44, className = '' }) => {
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [customAvatarUrl]);

  if (customAvatarUrl && !imgError) {
    return (
      <img
        src={customAvatarUrl}
        alt=""
        width={size}
        height={size}
        onError={() => setImgError(true)}
        style={{ width: size, height: size, borderColor: accentColor }}
        className={`shrink-0 rounded-xl object-cover border-2 bg-[#FAF8F4] dark:bg-[#25211D] ${className}`}
      />
    );
  }

  const idx = ((avatarId % AVATAR_COUNT) + AVATAR_COUNT) % AVATAR_COUNT;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={`shrink-0 rounded-xl ${className}`}
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="14" fill={accentColor} fillOpacity="0.14" />
      <rect x="2" y="2" width="44" height="44" rx="12" stroke={accentColor} strokeOpacity="0.32" strokeWidth="1.5" />
      {idx === 0 && (
        <g>
          <path d="M13 18L17 13L24 15L31 13L35 18V31C35 35 30 37 24 37C18 37 13 35 13 31V18Z" fill="#FAF8F4" stroke="#1C1917" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="19" cy="23" r="3.5" stroke={accentColor} strokeWidth="2" />
          <circle cx="29" cy="23" r="3.5" stroke={accentColor} strokeWidth="2" />
          <path d="M24 26L22 29H26L24 26Z" fill={accentColor} />
        </g>
      )}
      {idx === 1 && (
        <g>
          <path d="M12 14L19 20H29L36 14L34 31L24 37L14 31L12 14Z" fill={accentColor} fillOpacity="0.22" stroke="#1C1917" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="19.5" cy="24.5" r="1.8" fill="#1C1917" />
          <circle cx="28.5" cy="24.5" r="1.8" fill="#1C1917" />
          <circle cx="24" cy="31" r="2.2" fill="#1C1917" />
        </g>
      )}
      {idx === 2 && (
        <g>
          <circle cx="24" cy="27" r="10" fill="#FAF8F4" stroke="#1C1917" strokeWidth="2" />
          <path d="M15 18L18 11L24 16L30 11L33 18H15Z" fill={accentColor} stroke="#1C1917" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="20.5" cy="26.5" r="1.6" fill="#1C1917" />
          <circle cx="27.5" cy="26.5" r="1.6" fill="#1C1917" />
          <path d="M21 31C22.5 32.5 25.5 32.5 27 31" stroke="#1C1917" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      )}
      {idx === 3 && (
        <g>
          <path d="M13 13L19 18H29L35 13V28C35 33.5 30 37 24 37C18 37 13 33.5 13 28V13Z" fill="#FAF8F4" stroke="#1C1917" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="19.5" cy="24" r="1.8" fill={accentColor} />
          <circle cx="28.5" cy="24" r="1.8" fill={accentColor} />
          <path d="M10 25H16M32 25H38" stroke="#1C1917" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 29L24 31L26 29" stroke="#1C1917" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      )}
      {idx === 4 && (
        <g>
          <circle cx="24" cy="24" r="12" fill="#FAF8F4" stroke="#1C1917" strokeWidth="2" />
          <path d="M24 14L27.5 24L24 34L20.5 24L24 14Z" fill={accentColor} stroke="#1C1917" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="24" cy="24" r="2.2" fill="#FAF8F4" stroke="#1C1917" strokeWidth="1.5" />
        </g>
      )}
      {idx === 5 && (
        <g>
          <circle cx="24" cy="24" r="11.5" fill={accentColor} fillOpacity="0.18" stroke="#1C1917" strokeWidth="2" />
          <path d="M27 16C21.5 16.5 18 21 18.5 26C19 30 22.5 33 27 32.5C23.5 31 22 27.5 22.5 24C23 20.5 24.5 17.5 27 16Z" fill={accentColor} />
          <circle cx="29.5" cy="21" r="1.8" fill="#1C1917" />
        </g>
      )}
      {idx === 6 && (
        <g>
          <path d="M15 15C15 11.5 19 10 24 10C29 10 33 11.5 33 15V29L24 37L15 29V15Z" fill="#FAF8F4" stroke="#1C1917" strokeWidth="2" strokeLinejoin="round" />
          <path d="M16 21H32M24 14V35" stroke={accentColor} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}
      {idx === 7 && (
        <g>
          <path d="M18 14H30L32 29H16L18 14Z" fill="#FEF3C7" stroke="#1C1917" strokeWidth="2" strokeLinejoin="round" />
          <path d="M21 11H27M15 33H33" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="22" r="3" fill={accentColor} />
        </g>
      )}
      {idx === 8 && (
        <g>
          <circle cx="15" cy="15" r="4" fill="#1C1917" />
          <circle cx="33" cy="15" r="4" fill="#1C1917" />
          <circle cx="24" cy="25" r="11" fill="#FAF8F4" stroke="#1C1917" strokeWidth="2" />
          <ellipse cx="19.5" cy="24" rx="2.8" ry="3.4" fill="#1C1917" />
          <ellipse cx="28.5" cy="24" rx="2.8" ry="3.4" fill="#1C1917" />
          <circle cx="19.5" cy="23.5" r="1" fill="#FAF8F4" />
          <circle cx="28.5" cy="23.5" r="1" fill="#FAF8F4" />
          <path d="M22 30H26" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
      {idx === 9 && (
        <g>
          <rect x="12" y="12" width="24" height="24" rx="6" fill="#FAF8F4" stroke="#1C1917" strokeWidth="2" />
          <circle cx="18.5" cy="18.5" r="2.2" fill={accentColor} />
          <circle cx="29.5" cy="18.5" r="2.2" fill={accentColor} />
          <circle cx="24" cy="24" r="2.2" fill="#1C1917" />
          <circle cx="18.5" cy="29.5" r="2.2" fill={accentColor} />
          <circle cx="29.5" cy="29.5" r="2.2" fill={accentColor} />
        </g>
      )}
      {idx === 10 && (
        <g>
          <path d="M12 20L24 11L36 20L32 34H16L12 20Z" fill="#FAF8F4" stroke="#1C1917" strokeWidth="2" strokeLinejoin="round" />
          <path d="M16 21L21 23M32 21L27 23" stroke="#1C1917" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M24 24L21 30H27L24 24Z" fill={accentColor} />
        </g>
      )}
      {idx === 11 && (
        <g>
          <path d="M16 12H32L37 21L24 36L11 21L16 12Z" fill={accentColor} fillOpacity="0.22" stroke="#1C1917" strokeWidth="2" strokeLinejoin="round" />
          <path d="M11 21H37M16 12L20 21L24 36L28 21L32 12" stroke="#1C1917" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
};
