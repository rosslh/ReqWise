<script>
  import { stores } from "@sapper/app";
  const { session } = stores();
  import { onMount, onDestroy } from "svelte";
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

  let droppable;
  let draggingRequirement;

  onMount(() => {
    if (typeof window !== "undefined") {
      updateReqs();
      import("@shopify/draggable").then(({ default: Draggable }) => {
        const container = document.getElementById(`reqgroup-${reqgroup.id}`);
        droppable = new Draggable.Droppable(container, {
          handle: ".reqHandle",
          draggable: ".requirement",
          dropzone: ".requirementContainer"
        });
        droppable.on("drag:start", e => {
          draggingRequirement = e.source.dataset.reqid;
        });
      });
    }
  });

  onDestroy(() => {
    if (droppable) {
      droppable.destroy();
    }
  });
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

  ul.reqWrapper {
    width: 100%;
    overflow-x: auto;
    list-style: none;
    margin-top: 1rem;
  }
</style>

<div class="reqgroup" id={`reqgroup-${reqgroup.id}`}>
  <ReqgroupHeader {reqgroup} />
  <ReqgroupStatusBar {requirements} />
  <ReqgroupSelectTools
    {selectedReqs}
    update={updateReqs}
    isPrioritized={reqgroup.isPrioritized} />
  <ul class="reqWrapper">
    {#if requirements}
      {#each requirements as requirement}
        <Requirement
          isPrioritized={reqgroup.isPrioritized}
          selected={selectedReqs.includes(requirement.id)}
          {toggleReq}
          update={updateReqs}
          isDragging={requirement.id === draggingRequirement}
          {requirement} />
      {/each}
    {/if}
  </ul>
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
