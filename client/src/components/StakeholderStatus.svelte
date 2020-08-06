<script>
  export let isDraft = false;
  export let latestReviewStatus = "pending";
  export let inline = false;

  const statuses = {
    draft: {
      bgColor: "var(--secondaryText)",
      label: "Draft",
      width: "3.75rem",
    },
    pending: {
      bgColor: "var(--indigo)",
      label: "Pending",
      width: "4.5rem",
    },
    accept: {
      bgColor: "var(--green)",
      label: "Accepted",
      width: "4.5rem",
    },
    requestChanges: {
      bgColor: "var(--red)",
      label: "Changes Requested",
      width: "5rem",
    },
  };
</script>

<style>
  .indicator {
    --stakeholderStatusWidth: 3.75rem;
    position: relative;
    visibility: hidden;
    height: 5rem;
    width: var(--stakeholderStatusWidth);
    margin-top: -1.25rem;
    background-color: var(--secondaryText);
    color: var(--background1);
    font-size: 1.2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
  }

  .inlineIndicator {
    padding: 0 0.5rem;
    background-color: var(--grey2);
    color: var(--normalText);
    border-radius: 0.4rem;
    height: 2.5rem;
    display: inline-flex;
    align-items: center;
    font-size: 1.3rem;
    font-weight: 500;
  }

  .indicator.isDraft {
    visibility: visible;
  }

  .inlineIndicator.isDraft {
    background-color: var(--secondaryText);
    color: var(--background1);
  }

  .bottomTriangle {
    position: absolute;
    bottom: 0;
    width: 0;
    height: 0;
    border-left: calc(var(--stakeholderStatusWidth) / 2) solid transparent;
    border-right: calc(var(--stakeholderStatusWidth) / 2) solid transparent;
    border-bottom: 1rem solid var(--background1);
  }
</style>

<div
  class={`${inline ? 'inlineIndicator' : 'indicator'} ${isDraft ? 'isDraft' : ''}`}>
  {#if isDraft}Draft{:else}{latestReviewStatus}{/if}
  {#if !inline}
    <div class="bottomTriangle" aria-hidden={true} />
  {/if}
</div>
