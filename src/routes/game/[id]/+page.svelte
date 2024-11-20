<script lang="ts">
  import GameComponent from '../GameComponent.svelte';
  const { data } = $props();
</script>

<GameComponent {data} />
