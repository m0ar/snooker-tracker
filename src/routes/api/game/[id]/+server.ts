import type { PersistedGame } from '$lib/types';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, platform }) => {
  if (!platform?.env?.GAME_STATES) {
    throw error(500, 'KV binding not found');
  }

  const game = await platform.env.GAME_STATES.get(params.id);
  if (!game) {
    throw error(404, 'Game not found');
  }

  return json(JSON.parse(game));
};

export const POST: RequestHandler = async ({ request, platform }) => {
  if (!platform?.env) {
    throw error(500, 'Platform env not available');
  }

  if (!platform.env.GAME_STATES) {
    throw error(500, 'GAME_STATES binding not found');
  }

  try {
    const game: PersistedGame = await request.json();
    await platform.env.GAME_STATES.put(game.gameId, JSON.stringify(game));
    return json({ success: true });
  } catch (err) {
    console.error('KV operation failed:', err);
    throw error(500, 'Failed to save game state');
  }
};
