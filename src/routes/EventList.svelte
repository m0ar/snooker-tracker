<script lang="ts">
  import type { GameEvent } from '$lib/types';

  const { events } = $props<{ events: GameEvent[] }>();
  import { formatEvent } from '$lib/state-utils';
</script>

<div class="mt-4 rounded border">
  <div class="border-b bg-gray-50 p-2 text-sm font-medium">Event log</div>
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
