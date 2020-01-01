<script>
  import { Skeleton } from "svelte-loading-skeleton";
  export let title;
  export let rows = 1;
</script>

<style>
  .skeletonWrapper {
    margin: 3rem 0 2rem;
  }
  .rowWrapper {
    margin: 1rem 0;
  }
</style>

<!-- All properties below are default -->
<div class="skeletonWrapper">
  {#each Array(rows) as i}
    <div class="rowWrapper">
      <Skeleton
        key={i}
        width={title ? '12rem' : '100%'}
        height="3rem"
        borderRadius="4px"
        baseColor="#f0f0f0"
        highlightColor="#fefefe"
        animationLength={typeof window === 'undefined' ? '99s' : '1.2s'} />
    </div>
  {/each}
</div>
