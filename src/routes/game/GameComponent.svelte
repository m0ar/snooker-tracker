<script lang="ts">
  import { createSnookerStore } from '$lib/snooker-store';
  import { colors } from '$lib/types';
  import { getColors } from '$lib/state-utils';
  import FoulDialogue from '../FoulDialogue.svelte';
  import { onMount } from 'svelte';

  const { data } = $props();
  const store = createSnookerStore(data.initialState);
  const game = $store.currentState;
  const colorsOn = $derived(getColors().slice(-game.colorsRemaining));

  onMount(() => {
    if (!data.initialState) {
      history.replaceState({}, '', `/game/${$store.gameId}`);
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
      <div class="text-2xl font-bold text-blue-600">Game Over!</div>
      <div class="mt-2 text-xl">
        Player {game.winner! + 1} wins!
      </div>
      <button
        class="mt-4 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        onclick={() => store.resetGame()}
      >
        New Game
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
          onclick={() => store.showFoulSelection()}
        >
          Foul
        </button>
      </div>
    </div>
  {/if}
</div>

{#if $store.ui.showFoulDialog}
  <FoulDialogue {store} />
{/if}
