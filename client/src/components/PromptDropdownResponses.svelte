<script>
  export let prompt;
  export let responses;
  import ResponseEntry from "./ResponseEntry.svelte";

  $: options = prompt.options
    .map(option => {
      const count = responses.filter(
        r => r.brainstormResponseOption_id === option.id
      ).length;
      return {
        ...option,
        count,
        selectedByYou:
          prompt.yourResponse.brainstormResponseOption_id === option.id
      };
    })
    .sort((a, b) => b.count - a.count);

  $: totalCount = options.map(x => x.count).reduce((a, b) => a + b, 0);
</script>

{#if responses.length}
  {responses.length}
  {#if responses.length > 1}responses{:else}response{/if}
  received.
{:else}No responses yet{/if}

{#each options as option}
  <ResponseEntry {option} {totalCount} />
{/each}
