<script>
  import { onMount } from "svelte";
  import FaGithub from "svelte-icons/fa/FaGithub.svelte";
  import FaEdit from "svelte-icons/fa/FaEdit.svelte";
  import Requirement from "../components/Requirement.svelte";
  import AddRequirement from "../components/AddRequirement.svelte";
  import { get, post } from "../api.js";
  export let feature;
  export let uri;

  let requirements = null;
  onMount(async () => {
    if (uri) {
      requirements = await get(`${uri}/requirements`);
    }
  });

  import Skeleton from "../components/Skeleton.svelte";
  import FeatureStatus from "../components/FeatureStatus.svelte";

  const editFeature = () => {};
</script>

<style>
  div.feature {
    border: 0.1rem solid #d1d1d1;
    border-radius: 0.4rem;
    padding: 1.2rem;
    margin: 2rem 0;
    overflow: hidden;
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
    color: #333;
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
    height: 1.5rem;
    width: 1.5rem;
    margin-right: 0.5rem;
    box-sizing: border-box;
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
    <FeatureStatus {feature} />
    <button class="button-small button-outline">
      <div class="iconWrapper">
        <FaGithub />
      </div>
      Implement
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
          <Requirement {requirement} featureId={feature.pretty_id} />
        {/each}
      </tbody>
    {/if}
  </table>
  {#if !requirements}
    <Skeleton rows={2} noPadding />
  {/if}
  <div class="featureFooter">
    <AddRequirement {uri} />
    <button on:click={editFeature} class="button-outline button-small">
      <div class="iconWrapper">
        <FaEdit />
      </div>
      Edit
    </button>
  </div>
</div>
