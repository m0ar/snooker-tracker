import { createLongNameId } from 'mnemonic-id';
import { writable, type Writable } from 'svelte/store';
import type { ColorName, GameState, FoulPoints } from './types';
import { togglePlayer, updateStateWithPot, validatePot } from './state-utils';
import { writeRemoteState } from './api';

export const modLogCtx = {
  module: 'snooker-store',
};

export interface SnookerStore extends Writable<GameState> {
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
  gameId: createLongNameId(),
});

export const createSnookerStore = (initialStateOverride?: Partial<GameState>): SnookerStore => {
  const initialState = { ...createInitialState(), ...initialStateOverride };
  const { subscribe, set, update } = writable<GameState>(initialState);

  let saveTimeout: NodeJS.Timeout | undefined = undefined;
  let currentState: GameState = initialState;

  subscribe((state) => {
    currentState = state;
    // 5s debounce on remote writes
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => writeRemoteState(state), 1_000);
  });

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
