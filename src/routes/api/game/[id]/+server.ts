import type { PersistedGame } from '$lib/types';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { dev } from '$app/environment';

// In-memory storage fallback for local development
const localGameStore = new Map<string, string>();

export const GET: RequestHandler = async ({ params, platform }) => {
  // Use in-memory storage in development mode only
  if (dev) {
    const game = localGameStore.get(params.id!);
    if (!game) {
      throw error(404, 'Game not found');
    }
    return json(JSON.parse(game));
  }

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
  const game: PersistedGame = await request.json();

  // Use in-memory storage in development mode only
  if (dev) {
    localGameStore.set(game.gameId, JSON.stringify(game));
    return json({ success: true });
  }

  if (!platform?.env?.GAME_STATES) {
    throw error(500, 'GAME_STATES binding not found');
  }

  try {
    await platform.env.GAME_STATES.put(game.gameId, JSON.stringify(game));
    return json({ success: true });
  } catch (err) {
    console.error('KV operation failed:', err);
    throw error(500, 'Failed to save game state');
  }
};
