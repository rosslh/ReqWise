<script>
  import FaGithub from "svelte-icons/fa/FaGithub.svelte";

  export let reqgroup;
  export let requirements;
</script>

<style>
  div.reqgroupHeader {
    background-color: var(--offwhite1);
    margin: -1.2rem -1.2rem 0 -1.2rem;
    padding: 1.8rem 1.2rem;
    border-bottom: 0.1rem solid var(--grey1);
    min-height: 5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  div.reqgroupHeader h3 {
    font-size: 1.8rem;
    display: inline;
    margin: 0;
    max-width: 50%;
    /* color: #333; */
  }

  div.reqgroupHeader button {
    margin: 0;
  }

  .reqgroupPpuid {
    color: var(--grey4);
    margin-left: 0.5rem;
  }
</style>

<div class="reqgroupHeader">
  <h3>
    {reqgroup.name}
    <span class="reqgroupPpuid">#{reqgroup.ppuid}</span>
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
