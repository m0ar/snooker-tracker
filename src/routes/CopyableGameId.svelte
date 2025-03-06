<script lang="ts">
  const { gameId } = $props<{
    gameId: string;
  }>();

  let copied = $state(false);

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  };
</script>

<div class="text-center">
  <button
    class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-gray-500 transition-colors hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    onclick={copyGameId}
    title="Click to copy Game ID"
  >
    <span>{gameId}</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
    {#if copied}
      <span class="absolute mt-1 rounded bg-gray-800 px-2 py-1 text-xs text-white"> Copied! </span>
    {/if}
  </button>
</div>
