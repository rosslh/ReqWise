<script>
  export let prompt;
</script>

{#if prompt.responses.length}
  {prompt.responses.length}
  {#if prompt.responses.length > 1}responses{:else}response{/if}
  received.
{:else}No responses yet{/if}
