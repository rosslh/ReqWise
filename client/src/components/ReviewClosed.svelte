<script>
  export let review;

  import FaCheck from "svelte-icons/fa/FaCheck.svelte";
  import FaTimes from "svelte-icons/fa/FaTimes.svelte";
</script>

<style>
  .reviewClosedWrapper {
    display: flex;
    border: 0.1rem solid var(--borderColor);
    background-color: var(--background1);
    margin: 0.75rem 0;
    padding: 0.75rem;
    border-radius: 0.5rem;
    align-items: center;
  }

  :global(div.icon svg) {
    max-height: 1.5rem;
    max-width: 1.5rem;
  }

  div.icon {
    height: 3rem;
    width: 3rem;
    margin: 0 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    border-radius: 50%;
  }

  div.icon.requestChanges {
    background-color: var(--red);
  }

  div.icon.accept {
    background-color: var(--green);
  }

  div.reviewSummary {
    font-weight: 500;
  }
</style>

<div class="reviewClosedWrapper">
  <div class={`icon ${review.status}`}>
    {#if review.status === 'accept'}
      <FaCheck />
    {:else}
      <FaTimes />
    {/if}
  </div>
  <div>
    <div class="reviewSummary">
      {review.reviewerName}
      {#if review.status === 'accept'}
        accepted this revision:
      {:else}requested changes:{/if}
    </div>
    <blockquote>{review.comment}</blockquote>
  </div>
</div>
