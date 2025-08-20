import { createLongNameId } from 'mnemonic-id';
import { writable, type Writable } from 'svelte/store';
import type { ColorName, GameState, FoulPoints, GameEvent, PersistedGame, Player } from './types';
import {
  updateStateWithEvent,
  updateStoreWithEvent,
  validatePot,
  addEndGameStatsToState,
} from './state-utils';
import { writeRemoteState } from './api';
import { pushState } from '$app/navigation';

export const modLogCtx = {
  module: 'snooker-store',
};

export type Store = PersistedGame & {
  currentState: GameState;
};

export interface SnookerStore extends Writable<Store> {
  handlePot: (color: ColorName, points: number) => void;
  handleMiss: () => void;
  handleFoul: (points: FoulPoints, lostCurrentBall: boolean) => void;
  tossForRespot: () => void;
  chooseRespotTurn: (goesFirst: boolean) => void;
  resetGame: () => void;
  getState: () => Store;
  undoLastEvent: () => void;
}

export const createInitialState = (): GameState => ({
  currentPlayer: 0,
  scores: [0, 0],
  onRed: true,
  redsRemaining: 15,
  colorsRemaining: 6,
  currentBreak: 0,
  isFreeBall: false,
  isRespot: false,
  isOver: false,
});

export const createSnookerStore = (
  persistedGame?: PersistedGame,
  stateOverride?: GameState,
): SnookerStore => {
  const initial = persistedGame || {
    gameId: createLongNameId(),
    events: [],
  };

  let currentState;
  if (stateOverride !== undefined) {
    currentState = stateOverride;
  } else {
    currentState = initial.events.reduce(
      (state, event) => updateStateWithEvent(event, state),
      createInitialState(),
    );
    // Add end game stats if the game is over but stats aren't calculated yet
    if (currentState.isOver && !currentState.highestBreaks) {
      const tempStore = { currentState, events: initial.events };
      currentState = addEndGameStatsToState(tempStore);
    }
  }

  const { subscribe, set, update } = writable({
    ...initial,
    currentState,
  });

  let currentStore: Store;

  let saveTimeout: NodeJS.Timeout;
  subscribe((store) => {
    currentStore = store;
    console.log('Current store:', JSON.stringify(currentStore, undefined, 2));
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(
      () =>
        writeRemoteState({
          gameId: store.gameId,
          events: store.events,
        }),
      1_000,
    );
  });

  const appendEvent = (store: Store, event: Omit<GameEvent, 'timestamp' | 'sequenceNumber'>) => {
    const newEvent = {
      ...event,
      timestamp: Date.now(),
      sequenceNumber: store.events.length,
    } as GameEvent;
    return updateStoreWithEvent(store, newEvent);
  };

  const actions = {
    handlePot: (color: ColorName, points: number) => {
      const logCtx = { ...modLogCtx, fn: 'handlePot', params: { color, points } };

      update((store: Store) => {
        if (!validatePot(store.currentState, color)) {
          console.debug({ ...logCtx, state: store }, 'invalid pot, state unchanged');
          return store;
        }

        const newEvent = {
          type: 'POT' as const,
          player: store.currentState.currentPlayer,
          color,
          points,
        };

        return appendEvent(store, newEvent);
      });
    },

    handleMiss: () => {
      // const logCtx = { ...modLogCtx, fn: 'handleMiss', params: {} };

      update((store: Store): Store => {
        const newEvent = {
          type: 'MISS' as const,
          player: store.currentState.currentPlayer,
        };

        return appendEvent(store, newEvent);
      });
    },

    handleFoul: (points: FoulPoints, lostBall: boolean) => {
      // const logCtx = { ...modLogCtx, fn: 'handleFoul', params: { points, lostBall } };

      update((store: Store): Store => {
        const newEvent = {
          type: 'FOUL' as const,
          player: store.currentState.currentPlayer,
          points,
          lostBall,
        };

        return appendEvent(store, newEvent);
      });
    },

    tossForRespot: () => {
      // const logCtx = { ...modLogCtx, fn: 'tossForRespot', params: {} };

      update((store: Store): Store => {
        const newEvent = {
          type: 'RESPOT_TOSS_WINNER' as const,
          player: (Math.random() < 0.5 ? 0 : 1) as Player,
        };

        return appendEvent(store, newEvent);
      });
    },

    chooseRespotTurn: (goFirst: boolean) => {
      const logCtx = { ...modLogCtx, fn: 'chooseRespotTurn', params: { goFirst } };

      update((store: Store): Store => {
        if (store.currentState.respotChoice === undefined) {
          console.debug({ ...logCtx, state: store }, 'needs respotChoice, state unchanged');
          return store;
        }

        const newEvent = {
          type: 'RESPOT_CHOICE' as const,
          player: store.currentState.respotChoice,
          goFirst,
        };

        // console.debug({ ...logCtx, state: store, newEvents }, 'state changed');

        return appendEvent(store, newEvent);
      });
    },

    resetGame: () => {
      const newStore = {
        gameId: createLongNameId(),
        events: [],
        currentState: createInitialState(),
      };
      set(newStore);
      pushState(`/game/${newStore.gameId}`, {});
    },

    undoLastEvent: () => {
      update((store: Store): Store => {
        const newEvents = store.events.slice(0, -1);
        let newState = newEvents.reduce(
          (state, event) => updateStateWithEvent(event, state),
          createInitialState(),
        );
        // Add end game stats if the game is over but stats aren't calculated yet
        if (newState.isOver && !newState.highestBreaks) {
          const tempStore = { currentState: newState, events: newEvents };
          newState = addEndGameStatsToState(tempStore);
        }
        return {
          ...store,
          events: newEvents,
          currentState: newState,
        };
      });
    },

    getState: (): Store => currentStore,
  };

  return {
    subscribe,
    set,
    update,
    ...actions,
  };
};
