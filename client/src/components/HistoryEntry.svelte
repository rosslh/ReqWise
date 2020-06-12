<script>
  export let reqversion;
  import SimpleDiff from "./SimpleDiff.svelte";
  import DescDiff from "./DescDiff.svelte";
  import MdChevronRight from "svelte-icons/md/MdChevronRight.svelte";
  import { slide } from "svelte/transition";

  let showDiffs = false;

  $: viewDiff = () => {
    showDiffs = !showDiffs;
  };
</script>

<style>
  .outerWrapper {
    background-color: var(--background1);
    border-radius: 0.4rem;
    overflow: hidden;
    border: 0.1rem solid var(--borderColor);
    margin: 1rem 0;
  }
  .entryWrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 2rem 1rem;
  }

  button.viewDiff {
    margin-top: 0;
    background: none;
    border: none;
    color: var(--normalText);
    padding: 1.5rem;
    transition: transform 0.3s ease;
  }

  button.viewDiff.rotate {
    transform: rotate(90deg);
  }

  .secondary {
    color: var(--secondaryText);
  }

  .noRationale {
    color: var(--secondaryText);
    font-style: italic;
  }

  .rationale {
    font-weight: 500;
  }

  .bottom {
    font-size: 1.4rem;
  }

  h3 {
    font-size: 1.8rem;
    margin: 0 0 0.8rem;
  }

  .diffSection {
    background-color: var(--background2);
    padding: 1rem 2rem 3rem;
    border-top: 0.1rem solid var(--borderColor);
  }

  .diffSection h4 {
    margin-top: 1.2rem;
    margin-bottom: 0.8rem;
    font-size: 1.6rem;
  }
</style>

<div class="outerWrapper">
  <div class="entryWrapper">
    <div class="left">
      <div class="top">
        {#if reqversion.rationale}
          <h3 class="rationale">{reqversion.rationale}</h3>
        {:else}
          <h3 class="noRationale">No rationale</h3>
        {/if}
      </div>
      <div class="bottom">
        {reqversion.authorName}
        <span class="secondary">&lt;{reqversion.authorEmail}&gt;</span>
      </div>
    </div>
    <div class="right">
      <button
        class={`viewDiff ${showDiffs ? 'rotate' : ''}`}
        on:click={viewDiff}>
        <MdChevronRight />
      </button>
    </div>
  </div>
  {#if showDiffs}
    <div transition:slide={{ duration: 300 }} class="diffSection">
      <div>
        <h4>Description</h4>
        <DescDiff
          oldDescription={reqversion.previous_description}
          newDescription={reqversion.description} />
      </div>
      <div>
        <h4>Priority</h4>
        <SimpleDiff
          oldText={reqversion.previous_priority}
          newText={reqversion.priority} />
      </div>
      <div>
        <h4>Status</h4>
        <SimpleDiff
          oldText={reqversion.previous_status}
          newText={reqversion.status} />
      </div>
    </div>
  {/if}
</div>
