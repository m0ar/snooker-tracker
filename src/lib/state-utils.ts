import { createInitialState, modLogCtx } from './snooker-store';
import { colors } from './types';
import type { Player, ColorName, Color, GameState, GameEvent } from './types';
import { exhaustiveAssert } from './util';

export const getColors = (): [ColorName, Color][] =>
  Object.entries(colors).slice(1) as [ColorName, Color][];

export const updateStateWithEvent = (
  event: GameEvent,
  state: GameState = createInitialState(),
): GameState => {
  switch (event.type) {
    case 'POT': {
      if (!validatePot(state, event.color)) {
        return state;
      }
      return updateStateWithPot(state, event.color, event.points, event.player);
    }

    case 'MISS':
      return {
        ...state,
        currentPlayer: togglePlayer(state.currentPlayer),
        currentBreak: 0,
        onRed: state.redsRemaining > 0,
      } satisfies GameState;

    case 'FOUL': {
      const newState = { ...state };
      newState.scores[togglePlayer(state.currentPlayer)] += event.points;

      if (event.lostBall) {
        if (newState.onRed) {
          newState.redsRemaining -= 1;
        } else {
          newState.colorsRemaining -= 1;
        }
      }

      newState.currentPlayer = togglePlayer(state.currentPlayer);
      newState.currentBreak = 0;
      newState.onRed = newState.redsRemaining > 0;
      return newState satisfies GameState;
    }

    case 'RESPOT_TOSS':
      return {
        ...state,
        respotChoice: event.winner,
      } satisfies GameState;

    case 'RESPOT_CHOICE':
      return {
        ...state,
        currentPlayer: event.goFirst ? event.player : togglePlayer(event.player),
        respotChoice: undefined,
      } satisfies GameState;
  }
};

export const togglePlayer = (current: Player): Player => (current === 0 ? 1 : 0);
export const validatePot = (state: GameState, color: ColorName): boolean => {
  const logCtx = { ...modLogCtx, fn: 'validatePot', params: { state, color } };
  // Check if trying to pot wrong ball type
  if (!state.onRed && color === 'red') {
    console.warn({ ...logCtx, wanted: 'colored' }, 'invalid pot');
    return false;
  }
  if (state.onRed && color !== 'red') {
    console.warn({ ...logCtx, wanted: 'red' }, 'invalid pot');
    return false;
  }

  // Check end game sequence
  const expectedColor = getColors().at(-state.colorsRemaining)![0];
  if (state.redsRemaining === 0 && color !== expectedColor) {
    console.warn({ ...logCtx, wanted: expectedColor }, 'invalid pot');
    return false;
  }

  return true;
};
const maybeHandleGameEnd = (state: GameState): Partial<GameState> => {
  if (state.colorsRemaining > 0) return {};

  if (state.scores[0] === state.scores[1]) {
    return {
      colorsRemaining: 1,
      isRespot: true,
    };
  }

  return {
    isOver: true,
    winner: state.scores[0] > state.scores[1] ? 0 : 1,
  };
};

export const updateStateWithPot = (
  state: GameState,
  color: ColorName,
  points: number,
  player: Player,
): GameState => {
  const newState = { ...state };
  const isEndPhase = state.redsRemaining === 0;

  newState.scores[player] += points;
  newState.currentBreak += points;

  if (color === 'red') {
    newState.redsRemaining -= 1;
    newState.onRed = false;
  } else if (!isEndPhase) {
    newState.onRed = true;
  } else {
    newState.colorsRemaining -= 1;
    newState.onRed = false;
    // If this was the last ball, this adds game end state
    Object.assign(newState, maybeHandleGameEnd(newState));
  }

  return newState;
};

export const formatEvent = (event: GameEvent): string => {
  switch (event.type) {
    case 'POT':
      return `Player ${event.player + 1} pots ${event.color}`;
    case 'MISS':
      return `Player ${event.player + 1} misses`;
    case 'FOUL':
      return `Player ${event.player + 1} fouls (${event.points} points)`;
    case 'RESPOT_TOSS':
      return `Player ${event.winner + 1} wins respot toss`;
    case 'RESPOT_CHOICE':
      return `Player ${event.player + 1} chooses to go ${event.goFirst ? 'first' : 'second'}`;
    default:
      return exhaustiveAssert(event);
  }
};
