<script>
  export let reqversion;

  const viewDiff = () => {};
</script>

<style>
  .entryWrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--background2);
    border-radius: 0.4rem;
    overflow: hidden;
    border: 0.1rem solid var(--borderColor);
    padding: 2rem;
    margin: 1rem 0;
  }

  button.viewDiff {
    margin-top: 0;
  }

  .secondary {
    color: var(--secondaryText);
  }

  .rationale {
    font-weight: 500;
  }

  .bottom {
    font-size: 1.4rem;
  }
</style>

<div class="entryWrapper">
  <div class="left">
    <div class="top">
      {#if reqversion.rationale}
        <span class="rationale">{reqversion.rationale}</span>
      {:else}
        <span class="secondary">No rationale</span>
      {/if}
    </div>
    <div class="bottom">
      {reqversion.authorName}
      <span class="secondary">&lt;{reqversion.authorEmail}&gt;</span>
    </div>
  </div>
  <div class="right">
    <button
      class="viewDiff button button-small button-outline"
      on:click={viewDiff}>
      View
    </button>
  </div>
</div>
