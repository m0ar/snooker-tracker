import type { GameState } from './types';

export const writeRemoteState = async (state: GameState) => {
  try {
    await fetch('/api/game', {
      method: 'POST',
      body: JSON.stringify(state),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};
