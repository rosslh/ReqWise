<script>
  import FaGithub from "svelte-icons/fa/FaGithub.svelte";

  export let feature;
  export let requirements;

  import Skeleton from "./Skeleton.svelte";
</script>

<style>
  div.featureHeader {
    background-color: var(--offwhite1);
    margin: -1.2rem -1.2rem 0 -1.2rem;
    padding: 1.2rem;
    border-bottom: 0.1rem solid var(--grey1);
    min-height: 5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  div.featureHeader h3 {
    font-size: 1.8rem;
    display: inline;
    margin: 0;
    max-width: 50%;
    /* color: #333; */
  }

  div.featureHeader button {
    margin: 0;
  }
</style>

<div class="featureHeader">
  <h3>
    {#if feature}
      {feature.name}
    {:else}
      <Skeleton noPadding inline height="1.7rem" />
    {/if}
  </h3>
  {#if requirements && requirements.some(r => r.status === 'accepted')}
    <button class="button-small button-outline">
      <div class="iconWrapper">
        <FaGithub />
      </div>
      Implement Accepted
    </button>
  {/if}
</div>
