<script lang="ts">
  import { FOUL_POINTS, snookerStore } from '$lib/snooker-store';

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

    {#if $snookerStore.onRed || $snookerStore.redsRemaining === 0}
      <label class="mb-4 flex items-center gap-2">
        <input type="checkbox" class="h-4 w-4" bind:checked={lostBall} />
        <span>{$snookerStore.onRed ? 'Red' : 'Color'} was lost</span>
      </label>
    {/if}

    <div class="flex gap-2">
      <button
        class="flex-1 rounded bg-red-500 p-2 text-white hover:bg-red-600"
        onclick={() => {
          if (selectedPoints) snookerStore.handleFoul(selectedPoints, lostBall);
        }}
      >
        Confirm
      </button>
      <button
        class="flex-1 rounded bg-gray-500 p-2 text-white hover:bg-gray-600"
        onclick={() => snookerStore.cancelFoul()}
      >
        Cancel
      </button>
    </div>
  </div>
</div>
