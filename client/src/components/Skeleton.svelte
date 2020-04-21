<script>
  import { Skeleton } from "svelte-loading-skeleton";
  export let inline;
  export let rows = 1;
  export let noPadding;
  export let height;
</script>

<style>
  .yesPadding {
    margin: 3rem 0 2rem;
    padding: 0;
  }

  .noPadding {
    margin: 0;
    padding: 0;
  }

  .rowWrapper {
    margin: 0;
    margin-bottom: 1rem;
    padding: 0;
  }
</style>

<div class={noPadding ? 'noPadding' : 'yesPadding'}>
  {#each Array(rows) as i}
    <div class={rows > 1 ? 'rowWrapper' : 'noPadding'}>
      <Skeleton
        width={inline ? '14rem' : '100%'}
        height={height || '3rem'}
        borderRadius="0.5rem"
        baseColor="#f0f0f0"
        highlightColor="#fefefe"
        animationLength={typeof window === 'undefined' ? '2.4s' : '1.2s'} />
    </div>
  {/each}
</div>
