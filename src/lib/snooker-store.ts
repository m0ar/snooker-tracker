import { writable, type Writable } from 'svelte/store';

const modLogCtx = {
  module: 'snooker-store',
};

type Player = 0 | 1;

export interface GameState {
  currentPlayer: Player;
  scores: [number, number];
  onRed: boolean;
  redsRemaining: number;
  colorsRemaining: number;
  currentBreak: number;
  showFoulDialog: boolean;
  isRespot: boolean;
  respotChoice?: Player;
  isOver: boolean;
  winner?: Player;
}

export type ColorName = 'red' | 'yellow' | 'green' | 'brown' | 'blue' | 'pink' | 'black';

interface Color {
  points: number;
  bg: string;
}

export const colors = {
  red: { points: 1, bg: 'bg-red-600 hover:bg-red-700' },
  yellow: { points: 2, bg: 'bg-yellow-500 hover:bg-yellow-600' },
  green: { points: 3, bg: 'bg-green-600 hover:bg-green-700' },
  brown: { points: 4, bg: 'bg-amber-700 hover:bg-amber-800' },
  blue: { points: 5, bg: 'bg-blue-600 hover:bg-blue-700' },
  pink: { points: 6, bg: 'bg-pink-600 hover:bg-pink-700' },
  black: { points: 7, bg: 'bg-black hover:bg-gray-900' },
} as const;

export type Colors = typeof colors;

export const getColors = (): [ColorName, Color][] =>
  Object.entries(colors).slice(1) as [ColorName, Color][];

const togglePlayer = (current: Player): Player => (current === 0 ? 1 : 0);

export const FOUL_POINTS = [4, 5, 6, 7] as const;
export type FoulPoints = (typeof FOUL_POINTS)[number];

const createInitialState = (): GameState => ({
  currentPlayer: 0,
  scores: [0, 0],
  onRed: true,
  redsRemaining: 15,
  colorsRemaining: 6,
  currentBreak: 0,
  showFoulDialog: false,
  isRespot: false,
  isOver: false,
});

interface SnookerStore extends Writable<GameState> {
  handlePot: (color: ColorName, points: number) => void;
  handleMiss: () => void;
  handleFoul: (points: FoulPoints, lostCurrentBall: boolean) => void;
  showFoulSelection: () => void;
  cancelFoul: () => void;
  tossForRespot: () => void;
  chooseRespotTurn: (goesFirst: boolean) => void;
  resetGame: () => void;
  getState: () => GameState;
}
const validatePot = (state: GameState, color: ColorName): boolean => {
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

const updateStateWithPot = (state: GameState, color: ColorName, points: number): GameState => {
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

export const createSnookerStore = (initialStateOverride?: Partial<GameState>): SnookerStore => {
  const initialState = { ...createInitialState(), ...initialStateOverride };
  const { subscribe, set, update } = writable<GameState>(initialState);

  let currentState: GameState = initialState;
  subscribe((state) => (currentState = state));

  const actions = {
    handlePot: (color: ColorName, points: number) => {
      const logCtx = { ...modLogCtx, fn: 'handlePot', params: { color, points } };
      update((state) => {
        if (!validatePot(state, color)) {
          console.debug({ ...logCtx, state }, 'invalid pot, state unchanged');
          return state;
        }
        const newState = updateStateWithPot(state, color, points);
        console.debug({ ...logCtx, state, newState }, 'state changed');
        return newState;
      });
    },

    handleMiss: () => {
      const logCtx = { ...modLogCtx, fn: 'handleMiss', params: {} };
      update((state) => {
        const newState = {
          ...state,
          currentPlayer: togglePlayer(state.currentPlayer),
          currentBreak: 0,
          onRed: state.redsRemaining > 0,
        };
        console.debug({ ...logCtx, state, newState }, 'state changed');
        return newState;
      });
    },

    showFoulSelection: () => {
      update((state) => ({
        ...state,
        showFoulDialog: true,
      }));
    },

    cancelFoul: () => {
      update((state) => ({
        ...state,
        showFoulDialog: false,
      }));
    },

    handleFoul: (points: FoulPoints, lostCurrentBall: boolean) => {
      const logCtx = { ...modLogCtx, fn: 'handleFoul', params: { points, lostCurrentBall } };
      update((state) => {
        const newState = { ...state };

        newState.scores[togglePlayer(state.currentPlayer)] += points;

        if (lostCurrentBall) {
          if (newState.onRed) {
            newState.redsRemaining -= 1;
          } else {
            newState.colorsRemaining -= 1;
          }
        }

        newState.currentPlayer = togglePlayer(state.currentPlayer);
        newState.currentBreak = 0;
        newState.onRed = newState.redsRemaining > 0;
        newState.showFoulDialog = false;
        console.debug({ ...logCtx, state, newState }, 'state changed');
        return newState;
      });
    },

    tossForRespot: () => {
      const logCtx = { ...modLogCtx, fn: 'tossForRespot', params: {} };
      update((state) => {
        const newState: GameState = {
          ...state,
          respotChoice: Math.random() < 0.5 ? 0 : 1,
        };
        console.debug({ ...logCtx, state, newState }, `state changed`);
        return newState;
      });
    },

    chooseRespotTurn: (goesFirst: boolean) => {
      const logCtx = { ...modLogCtx, fn: 'chooseRespotTurn', params: {} };
      update((state) => {
        if (state.respotChoice === undefined) {
          console.debug({ ...logCtx, state }, 'needs respotChoice, state unchanged');
          return state;
        }
        const newState = {
          ...state,
          currentPlayer: goesFirst ? state.respotChoice : togglePlayer(state.respotChoice),
          respotChoice: undefined,
        };
        console.debug({ ...logCtx, state, newState }, 'state changed');
        return newState;
      });
    },

    resetGame: () => {
      set(createInitialState());
    },

    // Test helper
    getState: () => currentState,
  };

  return {
    subscribe,
    set,
    update,
    ...actions,
  };
};

export const snookerStore = createSnookerStore();
