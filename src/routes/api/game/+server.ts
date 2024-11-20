import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { GameState } from '$lib/types';

export const POST: RequestHandler = async ({ request, platform }) => {
  if (!platform?.env) {
    throw error(500, 'Platform env not available');
  }

  if (!platform.env.GAME_STATES) {
    throw error(500, 'GAME_STATES binding not found');
  }

  try {
    const gameState: GameState = await request.json();
    await platform.env.GAME_STATES.put(gameState.gameId, JSON.stringify(gameState));
    return json({ success: true });
  } catch (err) {
    console.error('KV operation failed:', err);
    throw error(500, 'Failed to save game state');
  }
};
