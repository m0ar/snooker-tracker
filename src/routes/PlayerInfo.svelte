<script lang="ts">
  import type { Player } from '$lib/types';

  const { playerId, isPlaying, score } = $props<{
    playerId: Player;
    isPlaying: boolean;
    score: number;
  }>();
</script>

<div
  class="rounded-lg border-2 p-3 text-center transition-all duration-200 ease-in-out"
  class:border-transparent={!isPlaying}
  class:border-blue-500={isPlaying}
  class:bg-blue-50={isPlaying}
  class:shadow-md={isPlaying}
>
  <div class="whitespace-nowrap text-xl font-bold" class:text-blue-600={isPlaying}>
    Player {playerId + 1}
  </div>
  <div class="text-3xl">{score}</div>
</div>
