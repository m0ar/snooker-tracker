<script lang="ts">
  import Undo from 'lucide-svelte/icons/undo';
  import type { GameEvent } from '$lib/types';
  import { formatEvent } from '$lib/state-utils';

  const { events, onUndo } = $props<{
    events: GameEvent[];
    onUndo: () => void;
  }>();
</script>

<div class="mt-4 rounded border">
  <div class="flex items-center justify-between border-b bg-gray-50 p-2 text-sm font-medium">
    <span>Recent Events</span>
    <button
      class="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
      onclick={onUndo}
      disabled={events.length === 0}
      title="Undo last action"
    >
      <Undo size={16} />
    </button>
  </div>
  <div class="scrollbar-hide h-32 overflow-y-auto">
    <div class="flex flex-col-reverse divide-y">
      {#each events as event}
        <div class="p-2 text-sm">
          {formatEvent(event)}
        </div>
      {/each}
    </div>
  </div>
</div>
