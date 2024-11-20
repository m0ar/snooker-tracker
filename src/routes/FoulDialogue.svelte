<script lang="ts">
  import { type SnookerStore } from '$lib/snooker-store';
  import { FOUL_POINTS } from '$lib/types';
  const { store } = $props<{ store: SnookerStore }>();

  let selectedPoints: (typeof FOUL_POINTS)[number] | null = $state(null);
  let lostBall = $state(false);
</script>

<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
  <div class="rounded-lg bg-white p-4 shadow-lg">
    <h2 class="mb-4 text-lg font-bold">Select Foul Points</h2>

    <div class="mb-4 grid grid-cols-2 gap-2">
      {#each FOUL_POINTS as points}
        <button
          class="rounded p-2 text-white"
          class:bg-red-500={selectedPoints !== points}
          class:bg-red-700={selectedPoints === points}
          onclick={() => (selectedPoints = points)}
        >
          {points} points
        </button>
      {/each}
    </div>

    {#if $store.onRed || $store.redsRemaining === 0}
      <label class="mb-4 flex items-center gap-2">
        <input type="checkbox" class="h-4 w-4" bind:checked={lostBall} />
        <span>{$store.onRed ? 'Red' : 'Color'} was lost</span>
      </label>
    {/if}

    <div class="flex gap-2">
      <button
        class="flex-1 rounded bg-red-500 p-2 text-white hover:bg-red-600"
        onclick={() => {
          if (selectedPoints) store.handleFoul(selectedPoints, lostBall);
        }}
      >
        Confirm
      </button>
      <button
        class="flex-1 rounded bg-gray-500 p-2 text-white hover:bg-gray-600"
        onclick={() => store.cancelFoul()}
      >
        Cancel
      </button>
    </div>
  </div>
</div>
