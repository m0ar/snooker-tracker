import { modLogCtx } from './snooker-store';
import { colors } from './types';
import { Player } from './types';
import type { ColorName, Color, GameState } from './types';

export const getColors = (): [ColorName, Color][] =>
  Object.entries(colors).slice(1) as [ColorName, Color][];

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
): GameState => {
  const newState = { ...state };
  const isEndPhase = state.redsRemaining === 0;

  newState.scores[state.currentPlayer] += points;
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
