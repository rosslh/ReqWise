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
