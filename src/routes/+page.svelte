<script lang="ts">
  import { goto } from '$app/navigation';

  let gameId: string | undefined;
  let loading = false;
  let error: string | undefined;

  async function loadGame() {
    loading = true;
    error = '';
    try {
      const res = await fetch(`/api/game/${gameId}`);
      if (!res.ok) {
        throw new Error('Game not found');
      }
      await res.json(); // Verify game exists
      goto(`/game/${gameId}`);
    } catch {
      error = 'Failed to load game';
      loading = false;
    }
  }

  function startNewGame() {
    goto('/game');
  }
</script>

<div class="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
  <h1 class="mb-4 text-xl font-bold">Snooker Tracker</h1>

  <div class="space-y-4">
    <button
      class="w-full rounded bg-green-500 p-2 text-white hover:bg-green-600"
      onclick={startNewGame}
    >
      New Game
    </button>

    <div class="text-center">or</div>

    <div class="space-y-2">
      <input
        type="text"
        bind:value={gameId}
        placeholder="Enter Game ID"
        class="w-full rounded border p-2"
      />
      {#if error}
        <div class="text-sm text-red-500">{error}</div>
      {/if}
      <button
        class="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
        onclick={loadGame}
        disabled={!gameId || loading}
      >
        Load Game
      </button>
    </div>
  </div>
</div>
