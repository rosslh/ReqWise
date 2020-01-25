<script>
  import { onMount } from "svelte";
  import Requirement from "../components/Requirement.svelte";
  import FeatureSelectTools from "../components/FeatureSelectTools.svelte";
  import FeatureHeader from "../components/FeatureHeader.svelte";
  import FeatureStatusBar from "../components/FeatureStatusBar.svelte";
  import FeatureFooter from "../components/FeatureFooter.svelte";
  import Skeleton from "../components/Skeleton.svelte";
  import { get } from "../api.js";
  export let feature;
  export let uri;
  export let update;

  let requirements = null;
  const updateReqs = async () => {
    if (uri) {
      requirements = await get(`${uri}/requirements`);
    }
  };

  const updateFeature = async () => {
    feature = await get(uri);
  };

  onMount(updateReqs);

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
    position: relative;
    width: 100%;
  }

  div.tableWrapper {
    width: 100%;
    overflow-x: auto;
  }
</style>

<div class="feature">
  <FeatureHeader {feature} {requirements} />
  <FeatureStatusBar {requirements} />
  <FeatureSelectTools {selectedReqs} />
  <div class="tableWrapper">
    <table>
      <thead>
        <tr>
          <th />
          <th>Status</th>
          <th>Repository</th>
          <th>Description</th>
          <th>Priority</th>
          <th>Updated</th>
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
  </div>
  {#if !requirements}
    <Skeleton rows={2} noPadding />
  {/if}
  <FeatureFooter {feature} {uri} {updateReqs} {updateFeature} {update} />
</div>
