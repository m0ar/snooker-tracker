import { writable, type Writable } from 'svelte/store';

type Player = 0 | 1;

interface GameState {
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
}

const createSnookerStore = (): SnookerStore => {
  const { subscribe, set, update } = writable<GameState>(createInitialState());

  const actions = {
    handlePot: (color: ColorName, points: number) => {
      update((state) => {
        const isEndPhase = state.redsRemaining === 0;
        const newState = { ...state };

        if (isEndPhase) {
          console.log('endPhase', {
            colorsRemaining: state.colorsRemaining,
            colors: getColors()
          })
          const expectedColor = getColors().at(-state.colorsRemaining)![0];
          if (color !== expectedColor) {
            // Don't allow potting out of sequence
            return state;
          }
        }

        newState.scores[state.currentPlayer] += points;
        newState.currentBreak += points;

        if (color === 'red') {
          newState.redsRemaining -= 1;
          newState.onRed = false;
        } else if (!isEndPhase) {
          newState.onRed = newState.redsRemaining > 0;
        } else {
          newState.colorsRemaining -= 1;
          newState.onRed = newState.redsRemaining > 0;

          if (newState.colorsRemaining === 0) {
            if (newState.scores[0] === newState.scores[1]) {
              // Scores are tied - re-spot black
              newState.colorsRemaining = 1;
              newState.isRespot = true;
            } else {
              newState.isOver = true;
              newState.winner = newState.scores[0] > newState.scores[1] ? 0 : 1;
            }
          }
        }

        return newState;
      });
    },

    handleMiss: () => {
      update((state) => ({
        ...state,
        currentPlayer: togglePlayer(state.currentPlayer),
        currentBreak: 0,
        onRed: state.redsRemaining > 0,
      }));
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
        return newState;
      });
    },

    tossForRespot: () => {
      update(state => ({
        ...state,
        respotChoice: Math.random() < 0.5 ? 0 : 1
      }));
    },

    chooseRespotTurn: (goesFirst: boolean) => {
      update(state => {
        if (state.respotChoice === undefined) return state;
        return {
          ...state,
          currentPlayer: goesFirst ? state.respotChoice : togglePlayer(state.respotChoice),
          respotChoice: undefined
        };
      });
    },

    resetGame: () => {
      set(createInitialState());
    },
  };

  return {
    subscribe,
    set,
    update,
    ...actions,
  };
};

export const snookerStore = createSnookerStore();
