<script>
  import { onMount } from "svelte";
  import FaGithub from "svelte-icons/fa/FaGithub.svelte";
  import Requirement from "../components/Requirement.svelte";
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

  let newReq = "";
  const addReq = async e => {
    e.preventDefault();
    await post(`${uri}/requirements`, { id: "prettyId", description: newReq });
  };
</script>

<style lang="scss">
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
  }

  div.githubIconWrapper {
    height: 1.5rem;
    width: 1.5rem;
    margin-right: 0.5rem;
    box-sizing: border-box;
  }

  input.newReqInput {
    width: calc(100% - 10rem);
    background-color: none;
    z-index: 2;
  }
  form {
    border-top: 1px solid #eee;
    margin-top: 1rem;
    padding-top: 1rem;
    fieldset {
      display: flex;
      align-items: center;
      margin: 0 -0.2rem;
      position: relative;
    }
    fieldset > * {
      margin: 0 0.2rem;
    }

    button {
      width: 10rem;
    }
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
      <div class="githubIconWrapper">
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
          <Requirement {requirement} />
        {/each}
      </tbody>
    {/if}
  </table>
  {#if !requirements}
    <Skeleton rows={2} noPadding />
  {/if}
  <form>
    <label for="newReq">Add a requirement</label>
    <fieldset>
      <input
        type="text"
        id="newReq"
        name="newReq"
        class="newReqInput"
        bind:value={newReq} />
      <button on:click={addReq}>+ Add</button>
    </fieldset>
  </form>
</div>
