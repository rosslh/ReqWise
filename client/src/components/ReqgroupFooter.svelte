<script>
  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import { modalContent, modalProps } from "../stores.js";
  import AddRequirementModal from "./AddRequirementModal.svelte";

  import DeleteFeatureModal from "../components/DeleteFeatureModal.svelte";
  import EditFeatureModal from "../components/EditFeatureModal.svelte";

  export let updateReqs;
  export let updateReqgroup;
  export let update;
  export let reqgroup;
  export let requirements;

  const editReqgroup = () => {
    modalContent.set(EditFeatureModal);
    modalProps.set({ reqgroupId: reqgroup.id, updateReqgroup, reqgroup });
  };

  const deleteReqgroup = () => {
    modalContent.set(DeleteFeatureModal);
    modalProps.set({ reqgroupId: reqgroup.id, update });
  };
</script>

<style>
  div.reqgroupFooter {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>

<div class="reqgroupFooter">
  {#if !reqgroup.isMaxOneRequirement || (requirements && !requirements.length)}
    <button
      class="button-create"
      on:click={() => {
        modalContent.set(AddRequirementModal);
        modalProps.set({
          reqgroupId: reqgroup.id,
          update: updateReqs,
          isPrioritized: reqgroup.isPrioritized
        });
      }}>
      + Add Requirement
    </button>
  {:else}
    <div />
  {/if}
  <div>
    <button
      on:click={editReqgroup}
      class="button-outline button-small button-secondary button-clear">
      <div class="iconWrapper">
        <FaRegEdit />
      </div>
      Edit
    </button>
    {#if reqgroup.isDeletable}
      <button
        on:click={deleteReqgroup}
        class="button-outline button-small button-secondary button-clear">
        <div class="iconWrapper">
          <FaRegTrashAlt />
        </div>
        Delete
      </button>
    {/if}
  </div>
</div>