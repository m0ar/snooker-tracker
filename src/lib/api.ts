import type { PersistedGame } from './types';

export const writeRemoteState = async (state: PersistedGame) => {
  try {
    await fetch(`/api/game/${state.gameId}`, {
      method: 'POST',
      body: JSON.stringify(state),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};
