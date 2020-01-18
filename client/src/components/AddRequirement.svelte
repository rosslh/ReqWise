<script>
  import { modalContent, modalProps } from "../stores.js";
  import AddRequirementModal from "./AddRequirementModal.svelte";

  export let uri;
  export let update;
</script>

<button
  class="button-create"
  on:click={() => {
    modalContent.set(AddRequirementModal);
    modalProps.set({ uri, update });
  }}>
  + Add Requirement
</button>
