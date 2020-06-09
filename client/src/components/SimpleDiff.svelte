<script>
  export let newText;
  export let oldText;
</script>

<style>
  .capitalize {
    text-transform: capitalize;
  }

  span.simpleDiff {
    color: var(--secondaryText);
  }
  ins {
    color: var(--green);
    background-color: var(--lightGreen);
  }

  del {
    color: var(--red);
    background-color: var(--lightRed);
  }

  .secondary {
    color: var(--secondaryText);
  }
</style>

{#if typeof oldText === 'undefined' || !oldText}
  <ins class="capitalize">{newText}</ins>
{:else if oldText !== newText}
  <span class="capitalize simpleDiff">
    <del>{oldText}</del>
    &rarr;
    <ins>{newText}</ins>
  </span>
{:else}
  <span class="capitalize">{newText}</span>
  <span class="secondary">(no change)</span>
{/if}
