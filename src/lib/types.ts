export interface GameState {
  currentPlayer: Player;
  scores: [number, number];
  onRed: boolean;
  redsRemaining: number;
  colorsRemaining: number;
  currentBreak: number;
  isFreeBall: boolean;
  isRespot: boolean;
  respotChoice?: Player;
  isOver: boolean;
  winner?: Player;
}

export interface PersistedGame {
  gameId: string;
  events: GameEvent[];
  // Could add metadata like startTime, players, etc
}

export type GameEvent = {
  timestamp: number;
  sequenceNumber: number; // Prevent race conditions/ordering issues
  player: Player;
} & (
  | { type: 'POT'; color: ColorName; points: number }
  | { type: 'MISS' }
  | { type: 'FOUL'; points: FoulPoints; lostBall: boolean }
  | { type: 'RESPOT_TOSS_WINNER' }
  | { type: 'RESPOT_CHOICE'; goFirst: boolean }
);

export type ColorName = 'red' | 'yellow' | 'green' | 'brown' | 'blue' | 'pink' | 'black';
export type Color = {
  points: number;
  bg: string;
};
export const FOUL_POINTS = [4, 5, 6, 7] as const;
export type FoulPoints = (typeof FOUL_POINTS)[number];
export type Colors = typeof colors;
export type Player = 0 | 1;

export const colors = {
  red: { points: 1, bg: 'bg-red-600 hover:bg-red-700' },
  yellow: { points: 2, bg: 'bg-yellow-500 hover:bg-yellow-600' },
  green: { points: 3, bg: 'bg-green-600 hover:bg-green-700' },
  brown: { points: 4, bg: 'bg-amber-700 hover:bg-amber-800' },
  blue: { points: 5, bg: 'bg-blue-600 hover:bg-blue-700' },
  pink: { points: 6, bg: 'bg-pink-600 hover:bg-pink-700' },
  black: { points: 7, bg: 'bg-black hover:bg-gray-900' },
} as const;
