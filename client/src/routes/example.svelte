<script>
  import { fade } from "svelte/transition";
</script>

{#if typeof window !== 'undefined'}
  <div in:fade>Not SSR</div>
{:else}SSR{/if}
