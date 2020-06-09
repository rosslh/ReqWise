<script>
  export let newDescription;
  export let oldDescription;
  import Diff from "text-diff";
  const diff = new Diff();

  const descriptionDiff =
    newDescription &&
    (() => {
      let difference = diff.main(oldDescription || "", newDescription);
      diff.cleanupSemantic(difference);
      return diff.prettyHtml(difference);
    })();
</script>

<style>
  :global(.descDiff > *:first-child) {
    padding-left: 0;
  }

  :global(.descDiff > *:last-child) {
    padding-right: 0;
  }

  :global(.descDiff ins) {
    color: var(--green);
    background-color: var(--lightGreen);
  }

  :global(.descDiff del) {
    color: var(--red);
    background-color: var(--lightRed);
  }

  .secondary {
    color: var(--secondaryText);
  }
</style>

<div class="reqversionContent descDiff">
  {@html descriptionDiff}
  {#if newDescription === oldDescription && oldDescription}
    <span class="secondary">(no change)</span>
  {/if}
</div>
