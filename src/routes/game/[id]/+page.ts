import { error } from '@sveltejs/kit';

export const load = async ({ params, fetch }) => {
  if (params.id) {
    const res = await fetch(`/api/game/${params.id}`);
    if (!res.ok) throw error(404, 'Game not found');
    return {
      initialState: await res.json(),
    };
  }
  return { initialState: undefined };
};
