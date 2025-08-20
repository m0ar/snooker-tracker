<script lang="ts">
  import { createSnookerStore } from '$lib/snooker-store';
  import { colors } from '$lib/types';
  import { getColors } from '$lib/state-utils';
  import FoulDialogue from '../FoulDialogue.svelte';
  import { onMount } from 'svelte';
  import { replaceState } from '$app/navigation';
  import { page } from '$app/stores';
  import EventList from '../EventList.svelte';
  import CopyableGameId from '../CopyableGameId.svelte';
  import PlayerInfo from '../PlayerInfo.svelte';
  import EndgameScreen from '../EndgameScreen.svelte';

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
  {#if !game.isOver}
    <div class="mb-6 flex justify-between">
      <PlayerInfo playerId={0} isPlaying={game.currentPlayer === 0} score={game.scores[0]} />
      <div class="text-center">
        <div>Current Break</div>
        <div class="text-2xl">{game.currentBreak}</div>
      </div>
      <PlayerInfo playerId={1} isPlaying={game.currentPlayer === 1} score={game.scores[1]} />
    </div>
  {/if}

  {#if game.isOver}
    <EndgameScreen
      {game}
      events={$store.events}
      onUndo={() => store.undoLastEvent()}
      onNewGame={() => store.resetGame()}
    />
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
          class="rounded bg-gray-500 p-3 text-white hover:bg-gray-600"
          onclick={() => store.handleMiss()}
        >
          Miss
        </button>
        <button
          class="rounded bg-red-500 p-3 text-white hover:bg-red-600"
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
  <CopyableGameId gameId={$store.gameId} />
</div>

{#if showFoulDialog}
  <FoulDialogue
    {store}
    onClose={() => {
      showFoulDialog = false;
    }}
  />
{/if}
