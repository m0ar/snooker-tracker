<script lang="ts">
  import { createSnookerStore } from '$lib/snooker-store';
  import { colors } from '$lib/types';
  import { getColors } from '$lib/state-utils';
  import FoulDialogue from '../FoulDialogue.svelte';
  import { onMount } from 'svelte';
  import { replaceState } from '$app/navigation';
  import { page } from '$app/stores';
  import EventList from '../EventList.svelte';

  const { data } = $props();
  const store = createSnookerStore(data.initialState);
  const game = $derived($store.currentState);
  const colorsOn = $derived(getColors().slice(-game.colorsRemaining));
  let showFoulDialog = $state(false);

  onMount(() => {
    if (!data.initialState) {
      replaceState(`/game/${$store.gameId}`, $page.state);
    }
  });
</script>

<div class="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
  <div class="mb-6 flex justify-between">
    <div class="text-center">
      <div class="text-xl font-bold" class:text-blue-600={game.currentPlayer === 0}>Player 1</div>
      <div class="text-3xl">{game.scores[0]}</div>
    </div>
    <div class="text-center">
      <div>{$store.gameId}</div>
      <div>Current Break</div>
      <div class="text-2xl">{game.currentBreak}</div>
    </div>
    <div class="text-center">
      <div class="text-xl font-bold" class:text-blue-600={game.currentPlayer === 1}>Player 2</div>
      <div class="text-3xl">{game.scores[1]}</div>
    </div>
  </div>

  {#if game.isOver}
    <div class="mb-6 text-center">
      <div class="text-3xl font-bold text-blue-600 mb-4">Game Over!</div>
      <div class="bg-blue-50 rounded-lg p-4 shadow-outer mb-4">
        <div class="text-2xl font-bold text-green-700">
          🏆 Player {game.winner! + 1} wins! 🏆
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="bg-gray-50 p-3 rounded-lg shadow-sm">
          <h3 class="text-lg font-semibold text-gray-800 border-b pb-1 mb-2">Player 1</h3>
          <div class="flex justify-between"><span>Highest Break:</span> <span class="font-mono">{game.highestBreaks?.[0] ?? 'N/A'}</span></div>
          <div class="flex justify-between"><span>Longest Chain:</span> <span class="font-mono">{game.longestChains?.[0] ?? 'N/A'}</span></div>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg shadow-sm">
          <h3 class="text-lg font-semibold text-gray-800 border-b pb-1 mb-2">Player 2</h3>
          <div class="flex justify-between"><span>Highest Break:</span> <span class="font-mono">{game.highestBreaks?.[1] ?? 'N/A'}</span></div>
          <div class="flex justify-between"><span>Longest Chain:</span> <span class="font-mono">{game.longestChains?.[1] ?? 'N/A'}</span></div>
        </div>
      </div>

      <button
        class="mt-4 rounded bg-green-500 px-4 py-3 text-white font-bold hover:bg-green-600 transform hover:scale-105 transition-all shadow-lg"
        onclick={() => store.resetGame()}
      >
        Start New Game
      </button>
    </div>
  {:else}
    <div class="mb-4 text-center">
      <div>Reds Remaining: {game.redsRemaining}</div>

      {#if game.isRespot && game.respotChoice === undefined}
        <div class="mt-2 text-sm text-gray-600">
          {#if game.respotChoice === undefined}
            <button
              class="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
              onclick={() => store.tossForRespot()}
            >
              Toss coin for re-spot
            </button>
          {:else}
            <div>
              Player {game.respotChoice + 1} to choose who goes first
              <div class="mt-2 grid grid-cols-2 gap-2">
                <button
                  class="rounded bg-green-500 p-2 text-white hover:bg-green-600"
                  onclick={() => store.chooseRespotTurn(true)}
                >
                  Go First
                </button>
                <button
                  class="rounded bg-green-500 p-2 text-white hover:bg-green-600"
                  onclick={() => store.chooseRespotTurn(false)}
                >
                  Go Second
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <div class="space-y-4">
      <!-- Ball buttons -->
      <div class="grid grid-cols-3 gap-2">
        {#if game.onRed}
          <button
            class="rounded p-2 text-white {colors.red.bg}"
            onclick={() => store.handlePot('red', 1)}
            disabled={game.redsRemaining === 0}
          >
            Red
          </button>
        {:else}
          {#each colorsOn as [color, { points, bg }]}
            <button
              class="rounded p-2 text-white {bg}"
              onclick={() => store.handlePot(color, points)}
            >
              {color} ({points})
            </button>
          {/each}
        {/if}
      </div>

      <!-- Miss/Foul buttons -->
      <div class="grid grid-cols-2 gap-2">
        <button
          class="rounded bg-red-500 p-2 text-white hover:bg-red-600"
          onclick={() => store.handleMiss()}
        >
          Miss
        </button>
        <button
          class="rounded bg-red-500 p-2 text-white hover:bg-red-600"
          onclick={() => {
            showFoulDialog = true;
          }}
        >
          Foul
        </button>
      </div>
    </div>

    <EventList events={$store.events} onUndo={store.undoLastEvent} />
  {/if}
</div>

{#if showFoulDialog}
  <FoulDialogue
    {store}
    onClose={() => {
      showFoulDialog = false;
    }}
  />
{/if}
