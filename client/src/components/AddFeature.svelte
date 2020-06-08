<script>
  import { modalContent, modalProps } from "../stores.js";
  import AddFeatureModal from "./AddFeatureModal.svelte";

  export let id;
  export let update;
</script>

<style>

</style>

<div>
  <button
    class="button-create"
    on:click={() => {
      modalContent.set(AddFeatureModal);
      modalProps.set({ id, update });
    }}>
    Add Feature
  </button>
</div>
