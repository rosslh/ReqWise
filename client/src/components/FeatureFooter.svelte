<script>
  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import { modalContent, modalProps } from "../stores.js";
  import AddRequirementModal from "./AddRequirementModal.svelte";

  import DeleteFeatureModal from "../components/DeleteFeatureModal.svelte";
  import EditFeatureModal from "../components/EditFeatureModal.svelte";

  export let uri;
  export let updateReqs;
  export let updateFeature;
  export let update;
  export let feature;

  const editFeature = () => {
    modalContent.set(EditFeatureModal);
    modalProps.set({ uri, updateFeature, feature });
  };

  const deleteFeature = () => {
    modalContent.set(DeleteFeatureModal);
    modalProps.set({ uri, update });
  };
</script>

<style>
  div.featureFooter {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>

<div class="featureFooter">
  <button
    class="button-create"
    on:click={() => {
      modalContent.set(AddRequirementModal);
      modalProps.set({ uri, update: updateReqs });
    }}>
    + Add Requirement
  </button>
  <div>
    <button
      on:click={editFeature}
      class="button-outline button-small button-secondary button-clear">
      <div class="iconWrapper">
        <FaRegEdit />
      </div>
      Edit
    </button>
    <button
      on:click={deleteFeature}
      class="button-outline button-small button-secondary button-clear">
      <div class="iconWrapper">
        <FaRegTrashAlt />
      </div>
      Delete
    </button>
  </div>
</div>
