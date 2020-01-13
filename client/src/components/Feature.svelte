<script>
  import { onMount } from "svelte";
  import FaGithub from "svelte-icons/fa/FaGithub.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import FaEdit from "svelte-icons/fa/FaEdit.svelte";
  import FaArchive from "svelte-icons/fa/FaArchive.svelte";
  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaExchangeAlt from "svelte-icons/fa/FaExchangeAlt.svelte";
  import Requirement from "../components/Requirement.svelte";
  import AddRequirement from "../components/AddRequirement.svelte";
  import Skeleton from "../components/Skeleton.svelte";
  import { get, post } from "../api.js";
  export let feature;
  export let uri;

  let requirements = null;
  onMount(async () => {
    if (uri) {
      requirements = await get(`${uri}/requirements`);
    }
  });

  const editFeature = () => {};

  let showSelectTools = true;

  let selectedReqs = [];

  const toggleReq = id => {
    if (selectedReqs.includes(id)) {
      selectedReqs = selectedReqs.filter(x => x !== id);
    } else {
      selectedReqs = [...selectedReqs, id]; // push doesn't update state
    }
  };
</script>

<style>
  :global(.feature button) {
    margin-top: 0;
  }
  div.feature {
    border: 0.1rem solid #d1d1d1;
    border-radius: 0.4rem;
    padding: 1.2rem;
    margin: 2rem 0;
    overflow: hidden;
    background-color: white;
  }
  div.featureHeader {
    background-color: #fefefe;
    margin: -1.2rem -1.2rem 0 -1.2rem;
    padding: 1.2rem;
    border-bottom: 0.1rem solid #d1d1d1;
    min-height: 5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  div.featureHeader h2 {
    font-size: 1.8rem;
    display: inline;
    margin: 0;
    max-width: 50%;
    /* color: #333; */
  }

  div.featureHeader button {
    margin: 0;
  }

  div.featureFooter {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  div.iconWrapper {
    height: 1.4rem;
    width: 1.4rem;
    margin-right: 0.4rem;
    box-sizing: border-box;
  }

  .rotate90 {
    transform: rotate(90deg);
  }

  div.selectTools {
    height: 5.7rem;
    max-height: 5.7rem;
    display: flex;
    align-items: center;
    transition: all 0.1s linear;
    background-color: var(--offwhite1);
    border-bottom: 0.1rem solid var(--grey1);
    margin: 0 -1.5rem;
    padding: 0 1.5rem;
    opacity: 1;
  }

  div.selectTools > * {
    margin-right: 0.5rem;
    margin-top: 0;
  }
  div.selectTools.hidden {
    transform: scaleY(0%);
    max-height: 0;
    opacity: 0;
  }
</style>

<div class="feature">
  <div class="featureHeader">
    <h2>
      {#if feature}
        {feature.name}
      {:else}
        <Skeleton noPadding inline height="1.7rem" />
      {/if}
    </h2>
    <button class="button-small button-outline button-create">
      <div class="iconWrapper">
        <FaGithub />
      </div>
      Implement
    </button>
  </div>
  <div class={`selectTools ${selectedReqs.length ? '' : 'hidden'}`}>
    <button class="button-small">
      <div class="iconWrapper rotate90">
        <FaExchangeAlt />
      </div>
      Move to feature
    </button>
    <button class="button-small">
      <div class="iconWrapper">
        <FaEdit />
      </div>
      Change status
    </button>
    <button class="button-small button-caution">
      <div class="iconWrapper">
        <FaArchive />
      </div>
      Archive
    </button>
    <button class="button-small button-danger">
      <div class="iconWrapper">
        <FaRegTrashAlt />
      </div>
      Delete
    </button>
  </div>
  <table>
    <thead>
      <tr>
        <th />
        <th>Status</th>
        <th>ID</th>
        <th>Description</th>
        <th>Priority</th>
        <th />
      </tr>
    </thead>
    {#if requirements}
      <tbody>
        {#each requirements as requirement}
          <Requirement
            selected={selectedReqs.includes(requirement.id)}
            {toggleReq}
            {requirement}
            featureId={feature.pretty_id} />
        {/each}
      </tbody>
    {/if}
  </table>
  {#if !requirements}
    <Skeleton rows={2} noPadding />
  {/if}
  <div class="featureFooter">
    <AddRequirement {uri} />
    <button
      on:click={editFeature}
      class="button-outline button-small button-secondary">
      <div class="iconWrapper">
        <FaRegEdit />
      </div>
      Edit
    </button>
  </div>
</div>
