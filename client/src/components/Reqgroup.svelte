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

  import { get, patch } from "../api.js";
  import { reqgroupsToUpdate } from "../stores.js";

  export let reqgroup;
  export let update;

  let requirements = null;
  const updateReqs = () => {
    if (reqgroup && reqgroup.id) {
      get(
        `/reqgroups/${reqgroup.id}/requirements`,
        $session.user && $session.user.jwt
      ).then(r => {
        requirements = r;
        selectedReqs = [];
      });
    }
  };

  const updateReqgroup = async () => {
    reqgroup = await get(
      `/reqgroups/${reqgroup.id}`,
      $session.user && $session.user.jwt
    );
  };

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

  $: getIllegalParents = req => {
    const illegalParents = [];
    // req
    illegalParents.push(req);

    // req's descendents
    requirements
      .filter(x => {
        let currentReq = x;
        while (currentReq.parent_requirement_id) {
          if (
            currentReq.id === req ||
            currentReq.parent_requirement_id === req
          ) {
            return true;
          }
          currentReq = requirements.find(
            y => y.id === currentReq.parent_requirement_id
          );
        }
        return false;
      })
      .forEach(x => illegalParents.push(x.id));

    // req's parent
    illegalParents.push(
      requirements.find(x => x.id === req).parent_requirement_id || -1
    );

    return illegalParents;
  };

  let draggable;
  let draggingRequirement;
  let newParentRequirement;
  $: hiddenPlaceholders =
    (draggingRequirement &&
      requirements &&
      getIllegalParents(draggingRequirement)) ||
    [];

  const updateReqParent = async (childId, parentId) => {
    await patch(
      `/requirements/${childId}`,
      {
        parent_requirement_id: parentId === -1 ? null : parentId
      },
      $session.user && $session.user.jwt
    );
    updateReqs();
  };

  onMount(() => {
    if (typeof window !== "undefined") {
      updateReqs();
      import("@shopify/draggable").then(({ default: d }) => {
        const container = document.getElementById(`reqgroup-${reqgroup.id}`);
        draggable = new d.Draggable(container, {
          handle: ".reqHandle",
          draggable: ".draggable",
          mirror: {
            cursorOffsetX: 15,
            cursorOffsetY: 15
          }
        });
        draggable.on("drag:start", e => {
          draggingRequirement = e.source.dataset.reqid;
        });
        draggable.on("drag:over", e => {
          if (
            e.over.dataset.isplaceholder &&
            !hiddenPlaceholders.includes(e.over.dataset.parentid)
          ) {
            newParentRequirement =
              e.over.dataset.parentid === "-1" ? -1 : e.over.dataset.parentid;
          } else if (
            e.over.dataset.isplaceholder &&
            hiddenPlaceholders.includes(e.over.dataset.parentid)
          ) {
            console.error("Illegal drag and drop");
          }
        });
        draggable.on("drag:out", () => {
          newParentRequirement = undefined;
        });
        draggable.on("drag:stop", () => {
          if (newParentRequirement) {
            updateReqParent(draggingRequirement, newParentRequirement);
          }
          draggingRequirement = undefined;
          newParentRequirement = undefined;
        });
      });
    }
  });

  onDestroy(() => {
    if (draggable) {
      draggable.destroy();
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
    margin: 2rem -1.2rem;
    overflow: hidden;
    background-color: var(--background1);
    position: relative;
  }

  div.reqgroup.dragging,
  :global(div.reqgroup.dragging *) {
    cursor: grabbing !important;
  }

  ul.reqWrapper {
    width: 100%;
    overflow-x: auto;
    list-style-type: none;
    padding: 1rem 0 1.25rem; /* account for child placeholder negative margin */
    position: relative;
    margin-left: -1.2rem; /* account for parent padding */
  }
</style>

<div
  class={`reqgroup ${draggingRequirement ? 'dragging' : ''}`}
  id={`reqgroup-${reqgroup.id}`}>
  <ReqgroupHeader {reqgroup} />
  <ReqgroupStatusBar {requirements} />
  <ReqgroupSelectTools
    {selectedReqs}
    update={updateReqs}
    isPrioritized={reqgroup.isPrioritized} />
  <ul class="reqWrapper">
    {#if requirements}
      {#each requirements as requirement, index}
        <Requirement
          isPrioritized={reqgroup.isPrioritized}
          selected={selectedReqs.includes(requirement.id)}
          {toggleReq}
          update={updateReqs}
          {hiddenPlaceholders}
          {requirement}
          {index} />
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
