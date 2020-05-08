<script>
  import { stores } from "@sapper/app";
  const { session } = stores();
  import { onMount } from "svelte";
  import Requirement from "../components/Requirement.svelte";
  import ReqgroupSelectTools from "../components/ReqgroupSelectTools.svelte";
  import ReqgroupHeader from "../components/ReqgroupHeader.svelte";
  import ReqgroupStatusBar from "../components/ReqgroupStatusBar.svelte";
  import ReqgroupFooter from "../components/ReqgroupFooter.svelte";
  import Skeleton from "../components/Skeleton.svelte";

  import { get } from "../api.js";
  import { reqgroupsToUpdate } from "../stores.js";

  export let reqgroup;
  export let update;

  let requirements = null;
  const updateReqs = async () => {
    if (reqgroup && reqgroup.id) {
      requirements = await get(
        `/reqgroups/${reqgroup.id}/requirements`,
        $session.user && $session.user.jwt
      );
    }
  };

  const updateReqgroup = async () => {
    reqgroup = await get(
      `/reqgroups/${reqgroup.id}`,
      $session.user && $session.user.jwt
    );
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

  $: updateFromStream =
    $reqgroupsToUpdate.includes(reqgroup.id) &&
    (() => {
      updateReqgroup();
      updateReqs();
      $reqgroupsToUpdate = $reqgroupsToUpdate.filter(x => x != reqgroup.id);
    })();
</script>

<style>
  :global(.reqgroup button) {
    margin-top: 0;
  }
  div.reqgroup {
    border: 0.1rem solid var(--borderColor);
    border-radius: 0.4rem;
    padding: 1.2rem;
    margin: 2rem 0;
    overflow: hidden;
    background-color: var(--background1);
    position: relative;
    width: 100%;
  }

  div.tableWrapper {
    width: 100%;
    overflow-x: auto;
  }
</style>

<div class="reqgroup">
  <ReqgroupHeader {reqgroup} />
  <ReqgroupStatusBar {requirements} />
  <ReqgroupSelectTools
    {selectedReqs}
    update={updateReqs}
    isPrioritized={reqgroup.isPrioritized} />
  <div class="tableWrapper">
    <table>
      <thead>
        <tr>
          <th />
          <th>Description</th>
          <th>ID</th>
          <th>Status</th>
          {#if reqgroup.isPrioritized}
            <th>Priority</th>
          {/if}
          <th>Updated</th>
          <th />
        </tr>
      </thead>
      {#if requirements}
        <tbody>
          {#each requirements as requirement}
            <Requirement
              isPrioritized={reqgroup.isPrioritized}
              selected={selectedReqs.includes(requirement.id)}
              {toggleReq}
              update={updateReqs}
              {requirement} />
          {/each}
        </tbody>
      {/if}
    </table>
  </div>
  {#if !requirements}
    <Skeleton rows={2} noPadding />
  {/if}
  <ReqgroupFooter
    {reqgroup}
    {updateReqs}
    {updateReqgroup}
    {update}
    {requirements} />
</div>
