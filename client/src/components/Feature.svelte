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
    border: 0.1rem solid var(--grey2);
    border-radius: 0.4rem;
    padding: 1.2rem;
    margin: 2rem 0;
    overflow: hidden;
    background-color: white;
  }
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
    height: 8.5rem;
    max-height: 8.5rem;
    transition: all 0.1s linear;
    background-color: var(--offwhite1);
    border-bottom: 0.1rem solid var(--grey1);
    margin: 0 -1.5rem;
    padding: 0 1.5rem;
    opacity: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  div.selectTools > div.selectToolsLabel {
    margin-bottom: 1rem;
    height: 2.5rem;
    font-weight: 600;
  }
  div.selectTools > div.buttons {
    display: flex;
    align-items: center;
  }

  div.selectTools > div.buttons > * {
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
    <h3>
      {#if feature}
        {feature.name}
      {:else}
        <Skeleton noPadding inline height="1.7rem" />
      {/if}
    </h3>
    <button class="button-small button-outline button-create">
      <div class="iconWrapper">
        <FaGithub />
      </div>
      Implement
    </button>
  </div>
  <div class={`selectTools ${selectedReqs.length ? '' : 'hidden'}`}>
    <div class="selectToolsLabel">
      {selectedReqs.length} selected requirement{selectedReqs.length === 1 ? '' : 's'}:
    </div>
    <div class="buttons">
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
