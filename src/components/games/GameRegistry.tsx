import React from 'react';
import type { GameId } from '../../types/game';
import type { GameProps } from './GameShell';
import { GameXO } from './GameXO';
import { GameRPS } from './GameRPS';
import { GameNumberGuess } from './GameNumberGuess';
import { GameMillionaire } from './GameMillionaire';
import { GameTrivia } from './GameTrivia';
import { GameGuessCharacter } from './GameGuessCharacter';
import { GameGuessWord } from './GameGuessWord';
import { GameMemory } from './GameMemory';
import { GameSpeedChallenge } from './GameSpeedChallenge';
import { GameQADuel } from './GameQADuel';
import { GameMathChallenge } from './GameMathChallenge';
import { GameWordOrder } from './GameWordOrder';
import { GameTrueFalse } from './GameTrueFalse';
import { GameDrawGuess } from './GameDrawGuess';
import { GameLetterChallenge } from './GameLetterChallenge';
import { GameMafia } from './GameMafia';
import { GameRiddles } from './GameRiddles';
import {
  GameSudokuParty,
  GameSolvePuzzle,
  GameSpotDifferences,
  GameCompletePattern,
  GameNumberOrdering,
  GameCrackCode,
  GameStrongestMemory,
  GameCrosswordChallenge,
  GameHiddenWord,
  GameImagePuzzle,
} from './Phase2IntelligenceGames';
import {
  GameFastestAnswer,
  GamePerfectTiming,
  GameReactionDuel,
  GameTypingRace,
  GameFocusChallenge,
  GameFastCounting,
  GameOddOneOut,
  GameMentalMath,
  GameLetterArrange,
  GameRapidQuestions,
} from './Phase2SpeedGames';
import {
  GameSecretAgent,
  GameWhosLiar,
  GameForbiddenWord,
  GameWhoAmI,
  GameTwoTruthsLie,
  GameGuessAuthor,
  GameWeirdTranslator,
  GameFinishStory,
  GameWouldYouRather,
  GameSecretVote,
} from './Phase2SocialGames';
import {
  GameSketchRelay,
  GameGuessSong,
  GameMovieEmoji,
  GameEmojiChallenge,
  GameRandomStory,
  GameActingChallenge,
  GameShadowGuess,
  GameSoundImitation,
  GameJigsawAssembly,
  GameWordChain,
} from './Phase2CreativeGames';

export const ActiveGameRenderer: React.FC<{ gameId: GameId } & GameProps> = ({
  gameId,
  ...props
}) => {
  switch (gameId) {
    // Phase 1 (17 games)
    case 'xo':
      return <GameXO {...props} />;
    case 'rps':
      return <GameRPS {...props} />;
    case 'number-guess':
      return <GameNumberGuess {...props} />;
    case 'millionaire':
      return <GameMillionaire {...props} />;
    case 'trivia':
      return <GameTrivia {...props} />;
    case 'guess-character':
      return <GameGuessCharacter {...props} />;
    case 'guess-word':
      return <GameGuessWord {...props} />;
    case 'memory':
      return <GameMemory {...props} />;
    case 'speed-challenge':
      return <GameSpeedChallenge {...props} />;
    case 'qa-duel':
      return <GameQADuel {...props} />;
    case 'math-challenge':
      return <GameMathChallenge {...props} />;
    case 'word-order':
      return <GameWordOrder {...props} />;
    case 'true-false':
      return <GameTrueFalse {...props} />;
    case 'draw-guess':
      return <GameDrawGuess {...props} />;
    case 'letter-challenge':
      return <GameLetterChallenge {...props} />;
    case 'mafia':
      return <GameMafia {...props} />;
    case 'riddles':
      return <GameRiddles {...props} />;

    // Phase 2: Intelligence & Thinking (1-10)
    case 'sudoku-party':
      return <GameSudokuParty {...props} />;
    case 'solve-puzzle':
      return <GameSolvePuzzle {...props} />;
    case 'spot-differences':
      return <GameSpotDifferences {...props} />;
    case 'complete-pattern':
      return <GameCompletePattern {...props} />;
    case 'number-ordering':
      return <GameNumberOrdering {...props} />;
    case 'crack-code':
      return <GameCrackCode {...props} />;
    case 'strongest-memory':
      return <GameStrongestMemory {...props} />;
    case 'crossword-challenge':
      return <GameCrosswordChallenge {...props} />;
    case 'hidden-word':
      return <GameHiddenWord {...props} />;
    case 'image-puzzle':
      return <GameImagePuzzle {...props} />;

    // Phase 2: Challenge & Speed (11-20)
    case 'fastest-answer':
      return <GameFastestAnswer {...props} />;
    case 'perfect-timing':
      return <GamePerfectTiming {...props} />;
    case 'reaction-duel':
      return <GameReactionDuel {...props} />;
    case 'typing-race':
      return <GameTypingRace {...props} />;
    case 'focus-challenge':
      return <GameFocusChallenge {...props} />;
    case 'fast-counting':
      return <GameFastCounting {...props} />;
    case 'odd-one-out':
      return <GameOddOneOut {...props} />;
    case 'mental-math':
      return <GameMentalMath {...props} />;
    case 'letter-arrange':
      return <GameLetterArrange {...props} />;
    case 'rapid-questions':
      return <GameRapidQuestions {...props} />;

    // Phase 2: Party & Social (21-30)
    case 'secret-agent':
      return <GameSecretAgent {...props} />;
    case 'whos-liar':
      return <GameWhosLiar {...props} />;
    case 'forbidden-word':
      return <GameForbiddenWord {...props} />;
    case 'who-am-i':
      return <GameWhoAmI {...props} />;
    case 'two-truths-lie':
      return <GameTwoTruthsLie {...props} />;
    case 'guess-author':
      return <GameGuessAuthor {...props} />;
    case 'weird-translator':
      return <GameWeirdTranslator {...props} />;
    case 'finish-story':
      return <GameFinishStory {...props} />;
    case 'would-you-rather':
      return <GameWouldYouRather {...props} />;
    case 'secret-vote':
      return <GameSecretVote {...props} />;

    // Phase 2: Creative & Entertainment (31-40)
    case 'sketch-relay':
      return <GameSketchRelay {...props} />;
    case 'guess-song':
      return <GameGuessSong {...props} />;
    case 'movie-emoji':
      return <GameMovieEmoji {...props} />;
    case 'emoji-challenge':
      return <GameEmojiChallenge {...props} />;
    case 'random-story':
      return <GameRandomStory {...props} />;
    case 'acting-challenge':
      return <GameActingChallenge {...props} />;
    case 'shadow-guess':
      return <GameShadowGuess {...props} />;
    case 'sound-imitation':
      return <GameSoundImitation {...props} />;
    case 'jigsaw-assembly':
      return <GameJigsawAssembly {...props} />;
    case 'word-chain':
      return <GameWordChain {...props} />;
  }
};
