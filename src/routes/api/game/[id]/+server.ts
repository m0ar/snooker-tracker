import { error, json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, platform }) => {
  if (!platform?.env?.GAME_STATES) {
    throw error(500, 'KV binding not found');
  }

  const gameState = await platform.env.GAME_STATES.get(params.id);
  if (!gameState) {
    throw error(404, 'Game not found');
  }

  return json(JSON.parse(gameState));
};
