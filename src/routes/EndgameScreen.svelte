<script lang="ts">
  import { calculateScoreBreakdown } from '$lib/state-utils';
  import type { GameState, GameEvent } from '$lib/types';

  const { game, events, onUndo, onNewGame } = $props<{
    game: GameState;
    events: GameEvent[];
    onUndo: () => void;
    onNewGame: () => void;
  }>();

  const scoreBreakdown = $derived(calculateScoreBreakdown(events));
</script>

<div class="mb-6 text-center">
  <div class="mb-4 text-3xl font-bold text-blue-600">Game Over!</div>

  <!-- Score visualization bars -->
  <div class="mb-4 grid grid-cols-2 gap-8">
    {#each [0, 1] as player}
      {@const totalScore = game.scores[player]}
      {@const ownPoints = scoreBreakdown.ownPots[player]}
      {@const foulPoints = scoreBreakdown.opponentFouls[player]}
      {@const maxScore = Math.max(game.scores[0], game.scores[1])}
      {@const maxBarHeight = 200}
      {@const currentBarHeight =
        maxScore > 0 ? Math.max(100, (totalScore / maxScore) * maxBarHeight) : 100}
      {@const ownHeight = totalScore > 0 ? (ownPoints / totalScore) * currentBarHeight : 0}
      {@const foulHeight = totalScore > 0 ? (foulPoints / totalScore) * currentBarHeight : 0}

      <div class="flex flex-col items-center rounded-lg bg-gray-50 p-4">
        <!-- Player label with trophies for winner -->
        <div class="mb-2 flex items-center gap-2">
          {#if game.winner === player}
            <div class="text-lg">🏆</div>
          {/if}
          <div
            class="rounded-full px-3 py-1 text-sm font-bold text-white"
            class:bg-blue-600={game.winner !== player}
            class:bg-yellow-500={game.winner === player}
          >
            Player {player + 1}
          </div>
          {#if game.winner === player}
            <div class="text-lg">🏆</div>
          {/if}
        </div>

        <!-- Flexible bar section with bottom alignment -->
        <div class="flex flex-col items-center" style="height: {maxBarHeight + 50}px;">
          <!-- Spacer to push content to bottom -->
          <div style="height: {maxBarHeight - currentBarHeight}px;"></div>

          <!-- Total score above bar -->
          <div class="mb-1 text-2xl font-bold text-blue-600">
            {totalScore}
          </div>

          <!-- Bar aligned to bottom -->
          <div
            class="relative flex w-12 flex-col-reverse rounded-lg bg-gray-200 shadow-inner"
            style="height: {currentBarHeight}px;"
          >
            <!-- Own pots segment (bottom, green) -->
            {#if ownHeight > 0}
              <div
                class="w-full bg-green-500"
                style="height: {ownHeight}px;"
                class:rounded-b-lg={true}
                class:rounded-t-lg={foulHeight === 0}
                title="Pots: {ownPoints}"
              ></div>
            {/if}

            <!-- Opponent fouls segment (top, orange) -->
            {#if foulHeight > 0}
              <div
                class="w-full bg-orange-400"
                style="height: {foulHeight}px;"
                class:rounded-t-lg={true}
                class:rounded-b-lg={ownHeight === 0}
                title="From opponent penalties: {foulPoints}"
              ></div>
            {/if}
          </div>
        </div>

        <!-- Legend -->
        <div class="mt-2 text-xs text-gray-600">
          <div class="flex items-center gap-1">
            <div class="h-2 w-2 rounded bg-green-500"></div>
            <span>Pots: {ownPoints}</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="h-2 w-2 rounded bg-orange-400"></div>
            <span>Penalties: {foulPoints}</span>
          </div>
        </div>

        <!-- Break Stats Section -->
        <div class="mt-4 w-full rounded-md bg-white p-3 shadow-sm">
          <h4 class="mb-2 text-center text-xs font-semibold text-gray-700">Break Stats</h4>
          <div class="grid grid-cols-1 gap-2 text-xs">
            <div class="flex justify-between rounded bg-gray-50 px-2 py-1">
              <span class="text-gray-600">Highest:</span>
              <span class="font-mono font-semibold text-gray-800"
                >{game.highestBreaks?.[player] ?? 'N/A'}</span
              >
            </div>
            <div class="flex justify-between rounded bg-gray-50 px-2 py-1">
              <span class="text-gray-600">Longest:</span>
              <span class="font-mono font-semibold text-gray-800"
                >{game.longestBreaks?.[player] ?? 'N/A'}</span
              >
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-4 flex gap-2">
    <button
      class="flex-1 transform rounded bg-gray-500 px-4 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-gray-600"
      onclick={onUndo}
      disabled={events.length === 0}
    >
      Undo Last Action
    </button>
    <button
      class="flex-1 transform rounded bg-green-500 px-4 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-green-600"
      onclick={onNewGame}
    >
      Start New Game
    </button>
  </div>
</div>
