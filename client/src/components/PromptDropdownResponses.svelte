<script>
  export let prompt;

  $: options = prompt.options
    .map(option => {
      const count = prompt.responses.filter(
        r => r.brainstormResponseOption_id === option.id
      ).length;
      return { ...option, count };
    })
    .sort((a, b) => b.count - a.count);

  $: totalCount = options.map(x => x.count).reduce((a, b) => a + b, 0);
</script>

<style>
  .barWrapper {
    max-width: 45rem;
    display: flex;
    align-items: center;
    height: 4rem;
    border-radius: 0.8rem;
    border: 0.1rem solid var(--borderColor);
    margin: 1rem 0.5rem 0;
    position: relative;
    background-color: var(--background1);
    overflow: hidden;
  }

  .optionBar {
    background-color: var(--grey2);
    height: 100%;
    position: absolute;
  }

  .optionCount {
    font-weight: 600;
  }

  .optionCount,
  .optionValue {
    z-index: 3;
    padding: 0 2rem;
  }
</style>

{#if prompt.responses.length}
  {prompt.responses.length}
  {#if prompt.responses.length > 1}responses{:else}response{/if}
  received.
{:else}No responses yet{/if}

{#each options as option}
  <div class="barWrapper">
    <div
      class="optionBar"
      style={`width: ${(option.count / totalCount) * 100}%`} />
    <div class="optionCount">{option.count}</div>
    <div class="optionValue">{option.value}</div>
    <!-- <div class="optionSelected">{option.selectedByYou}</div> -->
  </div>
{/each}
