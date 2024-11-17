<script lang="ts">
  import { snookerStore, colors, getColors } from '$lib/snooker-store';
  import FoulDialogue from './FoulDialogue.svelte';

  let colorsOn = $derived(getColors().slice(-$snookerStore.colorsRemaining));
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

  {#if $snookerStore.isOver}
    <div class="mb-6 text-center">
      <div class="text-2xl font-bold text-blue-600">Game Over!</div>
      <div class="mt-2 text-xl">
        Player {$snookerStore.winner! + 1} wins!
      </div>
      <button
        class="mt-4 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        onclick={() => snookerStore.resetGame()}
      >
        New Game
      </button>
    </div>
  {:else}
    <div class="mb-4 text-center">
      <div>Reds Remaining: {$snookerStore.redsRemaining}</div>

      {#if $snookerStore.isRespot && $snookerStore.respotChoice === undefined}
        <div class="mt-2 text-sm text-gray-600">
          {#if $snookerStore.respotChoice === undefined}
            <button
              class="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
              onclick={() => snookerStore.tossForRespot()}
            >
              Toss coin for re-spot
            </button>
          {:else}
            <div>
              Player {$snookerStore.respotChoice + 1} to choose who goes first
              <div class="mt-2 grid grid-cols-2 gap-2">
                <button
                  class="rounded bg-green-500 p-2 text-white hover:bg-green-600"
                  onclick={() => snookerStore.chooseRespotTurn(true)}
                >
                  Go First
                </button>
                <button
                  class="rounded bg-green-500 p-2 text-white hover:bg-green-600"
                  onclick={() => snookerStore.chooseRespotTurn(false)}
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
        {#if $snookerStore.onRed}
          <button
            class="rounded p-2 text-white {colors.red.bg}"
            onclick={() => snookerStore.handlePot('red', 1)}
            disabled={$snookerStore.redsRemaining === 0}
          >
            Red
          </button>
        {:else}
          {#each colorsOn as [color, { points, bg }]}
            <button
              class="rounded p-2 text-white {bg}"
              onclick={() => snookerStore.handlePot(color, points)}
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
    </div>
  {/if}
</div>

{#if $snookerStore.showFoulDialog}
  <FoulDialogue />
{/if}
