import { json, type RequestHandler } from '@sveltejs/kit';
import type { GameState } from '$lib/types';

export const POST: RequestHandler = async ({ request, platform }) => {
  if (!platform?.env?.GAME_STATES) {
    throw new Error('KV binding not found');
  }

  const gameState: GameState = await request.json();
  await platform.env.GAME_STATES.put(gameState.gameId, JSON.stringify(gameState));

  return json({ success: true });
};
