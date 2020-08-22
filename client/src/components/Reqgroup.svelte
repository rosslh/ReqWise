<script>
  import { stores } from "@sapper/app";
  const { session } = stores();
  import { onMount, onDestroy, getContext } from "svelte";
  import RequirementInGroup from "../components/RequirementInGroup.svelte";
  import ReqgroupSelectTools from "../components/ReqgroupSelectTools.svelte";
  import ReqgroupHeader from "../components/ReqgroupHeader.svelte";
  import ReqgroupStatusBar from "../components/ReqgroupStatusBar.svelte";
  import ReqgroupFooter from "../components/ReqgroupFooter.svelte";

  import { get, patch } from "../api.js";
  import { reqgroupsToUpdate } from "../stores.js";

  export let reqgroup;
  export let update;
  export let hideStakeholderStatus = false;

  const scopes = getContext("scopes");

  $: requirements = reqgroup.requirements;

  const updateReqs = () => {
    if (reqgroup && reqgroup.id) {
      get(
        `/reqgroups/${reqgroup.id}/requirements`,
        $session.user && $session.user.jwt
      ).then((r) => {
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

  const toggleReq = ({ id, reqversion_id }) => {
    if (scopes.includes("member")) {
      if (selectedReqs.map((x) => x.id).includes(id)) {
        selectedReqs = selectedReqs.filter((x) => x.id !== id);
      } else {
        selectedReqs = [...selectedReqs, { id, reqversion_id }]; // push doesn't update state
      }
    }
  };

  $: updateFromStream =
    $reqgroupsToUpdate.includes(reqgroup.id) &&
    (() => {
      updateReqgroup();
      updateReqs();
      $reqgroupsToUpdate = $reqgroupsToUpdate.filter((x) => x != reqgroup.id);
    })();

  $: getIllegalParents = (req) => {
    const illegalParents = [];
    // req
    illegalParents.push(req);

    // req's descendents
    requirements
      .filter((x) => {
        let currentReq = x;
        while (currentReq && currentReq.parent_requirement_id) {
          if (
            currentReq.id === req ||
            currentReq.parent_requirement_id === req
          ) {
            return true;
          }
          currentReq = requirements.find(
            (y) => y.id === currentReq.parent_requirement_id
          );
        }
        return false;
      })
      .forEach((x) => illegalParents.push(x.id));

    const reqObject = requirements.find((x) => x.id === req);

    // req's parent
    illegalParents.push((reqObject && reqObject.parent_requirement_id) || -1);

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
        parent_requirement_id: parentId === -1 ? null : parentId,
      },
      $session.user && $session.user.jwt
    );
    updateReqs();
  };

  onMount(() => {
    if (typeof window !== "undefined") {
      // updateReqs();
      import("@shopify/draggable").then(({ default: d }) => {
        const container = document.getElementById(`reqgroup-${reqgroup.id}`);
        draggable = new d.Draggable(container, {
          handle: ".reqHandle",
          draggable: ".draggable",
          mirror: {
            cursorOffsetX: 15,
            cursorOffsetY: 15,
          },
          scrollable: {
            speed: 10,
            sensitivity: 30,
            scrollableElements: document.querySelectorAll(`div.pageContent`),
          },
        });
        draggable.on("drag:start", (e) => {
          draggingRequirement = e.source.dataset.reqid;
        });
        draggable.on("drag:over", (e) => {
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
  div.reqgroup {
    box-shadow: var(--boxShadow);
    border-radius: 0.5rem;
    padding: 1.25rem;
    margin: 2rem 0;
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
    margin-bottom: 0;
    position: relative;
  }

  div.noReqs {
    text-align: center;
    margin-top: 2rem;
    margin-bottom: 0.5rem;
    color: var(--secondaryText);
    font-size: 1.4rem;
  }
</style>

<div
  class={`reqgroup ${draggingRequirement ? 'dragging' : ''}`}
  id={`reqgroup-${reqgroup.id}`}>
  <ReqgroupHeader {reqgroup} {hideStakeholderStatus} />
  {#if reqgroup.is_draft && scopes.includes('member')}
    <ReqgroupStatusBar {requirements} />
  {/if}
  <ReqgroupSelectTools
    {selectedReqs}
    update={updateReqs}
    isPrioritized={reqgroup.isPrioritized} />
  {#if requirements && requirements.length}
    <ul class="reqWrapper" data-reqgroup={reqgroup.name}>
      {#each requirements as requirement, index}
        <RequirementInGroup
          is_draft={reqgroup.is_draft}
          isPrioritized={reqgroup.isPrioritized}
          selected={selectedReqs.map((x) => x.id).includes(requirement.id)}
          {toggleReq}
          update={updateReqs}
          {hiddenPlaceholders}
          {requirement}
          {index} />
      {/each}
    </ul>
  {:else}
    <div class="noReqs">No requirements yet</div>
  {/if}
  <ReqgroupFooter
    showEditButtons={reqgroup.is_draft}
    {reqgroup}
    {updateReqs}
    {updateReqgroup}
    {update}
    {requirements} />
</div>
