<script lang="ts">
  import { snookerStore, colors, getColors, FOUL_POINTS } from '$lib/snooker-store';

  let ballsOn = $derived(getColors().slice(-$snookerStore.colorsRemaining+1));
  let selectedPoints: typeof FOUL_POINTS[number] | null = null;
  let lostBall = false;
</script>

<div class="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
  <div class="mb-6 flex justify-between">
    <div class="text-center">
      <div class="text-xl font-bold" class:text-blue-600={$snookerStore.currentPlayer === 0}>
        Player 1
      </div>
      <div class="text-3xl">{$snookerStore.scores[0]}</div>
    </div>
    <div class="text-center">
      <div>Current Break</div>
      <div class="text-2xl">{$snookerStore.currentBreak}</div>
    </div>
    <div class="text-center">
      <div class="text-xl font-bold" class:text-blue-600={$snookerStore.currentPlayer === 1}>
        Player 2
      </div>
      <div class="text-3xl">{$snookerStore.scores[1]}</div>
    </div>
  </div>

  <div class="mb-4 text-center">
    <div>Reds Remaining: {$snookerStore.redsRemaining}</div>
  </div>

  <div class="space-y-4">
    {#if $snookerStore.onRed}
      <div class="grid grid-cols-3 gap-2">
        <button
          class="rounded p-2 text-white {colors.red.bg}"
          onclick={() => snookerStore.handlePot('red', 1)}
          disabled={$snookerStore.redsRemaining === 0}
        >
          Red
        </button>
        <button
          class="rounded bg-red-500 p-2 text-white hover:bg-red-600"
          onclick={() => snookerStore.handleMiss()}
        >
          Miss
        </button>
        <button
          class="rounded bg-red-500 p-2 text-white hover:bg-red-600"
          onclick={() => snookerStore.showFoulSelection()}
        >
          Foul
        </button>
      </div>
    {:else}
      <div class="grid grid-cols-3 gap-2">
        {#each ballsOn as [color, { points, bg }]}
          <button
            class="rounded p-2 text-white {bg}"
            onclick={() => snookerStore.handlePot(color, points)}
          >
            {color} ({points})
          </button>
        {/each}
        <button
          class="rounded bg-red-500 p-2 text-white hover:bg-red-600"
          onclick={() => snookerStore.handleMiss()}
        >
          Miss
        </button>
        <button
          class="rounded bg-red-500 p-2 text-white hover:bg-red-600"
          onclick={() => snookerStore.showFoulSelection()}
        >
          Foul
        </button>
      </div>
    {/if}
  </div>
</div>

{#if $snookerStore.showFoulDialog}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white p-4 rounded-lg shadow-lg">
      <h2 class="text-lg font-bold mb-4">Select Foul Points</h2>

      <div class="grid grid-cols-2 gap-2 mb-4">
        {#each FOUL_POINTS as points}
          <button
            class="p-2 rounded text-white"
            class:bg-red-500={selectedPoints !== points}
            class:bg-red-700={selectedPoints === points}
            onclick={() => selectedPoints = points}
          >
            {points} points
          </button>
        {/each}
      </div>

      {#if $snookerStore.onRed || $snookerStore.redsRemaining === 0}
      <label class="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          class="w-4 h-4"
          bind:checked={lostBall}
        >
        <span>{$snookerStore.onRed ? 'Red' : 'Color'} was lost</span>
      </label>
      {/if}

      <div class="flex gap-2">
        <button
          class="p-2 bg-red-500 hover:bg-red-600 text-white rounded flex-1"
          onclick={() => {
            if (selectedPoints) snookerStore.handleFoul(selectedPoints, lostBall);
          }}
        >
          Confirm
        </button>
        <button
          class="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded flex-1"
          onclick={() => snookerStore.cancelFoul()}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}
