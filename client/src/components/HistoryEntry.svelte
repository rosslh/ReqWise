<script>
  export let reqversion;
  import SimpleDiff from "./SimpleDiff.svelte";
  import DescDiff from "./DescDiff.svelte";
  import MdChevronRight from "svelte-icons/md/MdChevronRight.svelte";
  import { slide } from "svelte/transition";
  import { format } from "date-fns";

  let showDiffs = false;

  $: viewDiff = () => {
    showDiffs = !showDiffs;
  };
</script>

<style>
  .outerWrapper {
    background-color: var(--background1);
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: var(--boxShadow);
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
    transition: transform 0.3s ease;
    width: 4rem;
    height: 4rem;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  button.viewDiff .viewDiffIconWrapper {
    height: 3rem;
    width: 3rem;
  }

  :global(button.viewDiff svg) {
    max-height: 3rem;
    max-width: 3rem;
  }

  button.viewDiff.rotate {
    transform: rotate(90deg);
  }

  .authorEmail {
    color: var(--secondaryText);
    margin-left: 0.25rem;
  }

  .date {
    color: var(--secondaryText);
    margin-left: 1rem;
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
    display: flex;
    align-items: center;
  }

  h3 {
    font-size: 1.8rem;
    margin: 0 0 0.8rem;
  }

  .diffSection {
    background-color: var(--background2);
    padding: 1rem 2rem 3rem;
    /* border-top: 0.1rem solid var(--borderColor); */
  }

  .diffSection h4 {
    margin-top: 1.25rem;
    margin-bottom: 0.75rem;
    font-size: 1.6rem;
  }

  .authorImageWrapper {
    height: 3.5rem;
    width: 3.5rem;
    margin-right: 0.75rem;
  }

  .authorImageWrapper img,
  :global(.authorImageWrapper svg) {
    max-height: 100%;
    max-width: 100%;
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
        <div class="authorImageWrapper squircle">
          {#if reqversion.authorImageName}
            <img
              src={`https://storage.googleapis.com/user-file-storage/${reqversion.authorImageName}`}
              alt={reqversion.authorName} />
          {:else if reqversion.authorPlaceholderImage}
            {@html reqversion.authorPlaceholderImage}
          {/if}
        </div>
        {reqversion.authorName}
        <span class="authorEmail">&lt;{reqversion.authorEmail}&gt;</span>
        <time datetime={reqversion.created_at} class="date">
          {format(new Date(reqversion.created_at), 'h:mm a, MMMM d, yyyy')}
        </time>
      </div>
    </div>
    <div class="right">
      <button
        class={`viewDiff ${showDiffs ? 'rotate' : ''}`}
        on:click={viewDiff}>
        <div class="viewDiffIconWrapper">
          <MdChevronRight />
        </div>
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
    </div>
  {/if}
</div>
