<script>
  export let isDraft = false;
  export let latestReviewStatus;
  export let inline = false;

  $: status = isDraft ? "draft" : latestReviewStatus;

  const statuses = {
    draft: {
      bgColor: "var(--secondaryText)",
      label: "Draft",
      width: "3.75rem",
    },
    pending: {
      bgColor: "var(--indigo)",
      label: "Pending",
      width: "5rem",
    },
    accept: {
      bgColor: "var(--green)",
      label: "Accepted",
      width: "6rem",
    },
    requestChanges: {
      bgColor: "var(--red)",
      label: "Changes Requested",
      width: "7rem",
    },
  };
</script>

<style>
  .indicator {
    position: relative;
    height: 5.5rem;
    width: var(--stakeholderStatusWidth);
    margin-top: -1.25rem;
    color: var(--background1);
    font-size: 1.2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    text-transform: capitalize;
    text-align: center;
    line-height: 1.4rem;
  }

  .inlineIndicator {
    padding: 0 0.5rem;
    color: var(--background1);
    border-radius: 0.4rem;
    height: 2.5rem;
    display: inline-flex;
    align-items: center;
    font-size: 1.3rem;
    font-weight: 500;
    text-transform: uppercase;
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
  class={`${inline ? 'inlineIndicator' : 'indicator'}`}
  style={`
    background-color: ${statuses[status].bgColor};
    --stakeholderStatusWidth: ${statuses[status].width};
  `}>
  {statuses[status].label}
  {#if !inline}
    <div class="bottomTriangle" aria-hidden={true} />
  {/if}
</div>
