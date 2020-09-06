<script>
  import { getContext } from "svelte";

  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaLink from "svelte-icons/fa/FaLink.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import { modalContent, modalProps } from "../stores.js";
  import AddRequirementModal from "./AddRequirementModal.svelte";
  import MakeDraftModal from "./MakeDraftModal.svelte";
  import UnlinkReqgroupModal from "./UnlinkReqgroupModal.svelte";

  import DeleteFeatureModal from "../components/DeleteFeatureModal.svelte";
  import EditFeatureModal from "../components/EditFeatureModal.svelte";
  import FaUnlink from "svelte-icons/fa/FaUnlink.svelte";

  export let updateReqs;
  export let updateReqgroup;
  export let update;
  export let reqgroup;
  export let reqgroupId;
  export let requirements;

  export let unlinkId;
  export let unlinkType;

  const editReqgroup = () => {
    modalContent.set(EditFeatureModal);
    modalProps.set({ reqgroupId: reqgroupId, updateReqgroup, reqgroup });
  };

  const deleteReqgroup = () => {
    modalContent.set(DeleteFeatureModal);
    modalProps.set({ reqgroupId: reqgroupId, update });
  };

  const makeDraft = () => {
    modalContent.set(MakeDraftModal);
    modalProps.set({
      entityId: reqgroupId,
      entityType: "reqgroup",
      update: updateReqgroup,
    });
  };

  const scopes = getContext("scopes");

  const unlink = () => {
    modalProps.set({
      reqgroupId: reqgroup.id,
      update,
      unlinkId,
      unlinkType,
    });
    modalContent.set(UnlinkReqgroupModal);
  };
</script>

<style>
  div.reqgroupFooter {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  div.reqgroupFooter > div.right {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
</style>

<div class="reqgroupFooter">
  {#if reqgroup.is_draft && scopes.includes('member') && (!reqgroup.isMaxOneRequirement || (requirements && !requirements.length))}
    <button
      class="addRequirementButton button-create"
      data-reqgroup={reqgroup.name}
      on:click={() => {
        modalContent.set(AddRequirementModal);
        modalProps.set({
          reqgroupId: reqgroupId,
          update: updateReqs,
          isPrioritized: reqgroup.isPrioritized,
        });
      }}>
      Add Requirement
    </button>
  {:else}
    <div />
  {/if}
  <div class="right">
    {#if unlinkId}
      <button
        id="makeDraftButton"
        on:click={unlink}
        class="button-outline button-small button-secondary button-clear">
        <div class="iconWrapper">
          <FaUnlink />
        </div>
        Unlink
      </button>
    {:else}
      <a
        rel="prefetch"
        href={`/project/${reqgroup.project_id}/reqgroup/${reqgroupId}/linked`}
        class="button button-outline button-small button-secondary button-clear">
        <div class="iconWrapper iconWrapper-padded">
          <FaLink />
        </div>
        Linked
      </a>
    {/if}
    {#if !reqgroup.is_baseline}
      {#if !reqgroup.is_draft && scopes.includes('member')}
        <button
          data-cy="makeDraftButton"
          id="makeDraftButton"
          on:click={makeDraft}
          class="button-outline button-small button-secondary button-clear">
          <div class="iconWrapper">
            <FaRegEdit />
          </div>
          Convert to draft
        </button>
      {/if}
      {#if reqgroup.is_draft && scopes.includes('member')}
        <button
          id="editReqgroupButton"
          data-reqgroup={reqgroup.name}
          on:click={editReqgroup}
          class="button-outline button-small button-secondary button-clear">
          <div class="iconWrapper">
            <FaRegEdit />
          </div>
          Edit
        </button>
        {#if reqgroup.is_draft && reqgroup.isDeletable}
          <button
            on:click={deleteReqgroup}
            data-reqgroup={reqgroup.name}
            class="deleteReqgroupButton button-outline button-small
              button-secondary button-clear">
            <div class="iconWrapper">
              <FaRegTrashAlt />
            </div>
            Delete
          </button>
        {/if}
      {/if}
    {/if}
  </div>
</div>
