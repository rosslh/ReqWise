<script>
  import TextResponseEntry from "./TextResponseEntry.svelte";
  export let prompt;
  export let responses;
  export let update;

  $: responsesMapped = responses.map(x => ({
    ...x,
    selectedByYou: prompt.yourResponse && prompt.yourResponse.id === x.id
  }));
</script>

{#if responses.length}
  {responses.length}
  {#if responses.length > 1}responses{:else}response{/if}
  received.
{:else}No responses yet{/if}
{#each responsesMapped as response}
  <TextResponseEntry {response} {update} />
{/each}
