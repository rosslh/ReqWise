<script>
  import { modalContent, modalProps } from "../stores.js";
  import ChangeStatusModal from "./ChangeStatusModal.svelte";
  import ChangePriorityModal from "./ChangePriorityModal.svelte";
  import FaEdit from "svelte-icons/fa/FaEdit.svelte";
  import FaArchive from "svelte-icons/fa/FaArchive.svelte";
  import FaExchangeAlt from "svelte-icons/fa/FaExchangeAlt.svelte";
  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";

  import { put } from "../api.js";

  export let selectedReqs;
  export let update;

  const moveToFeature = async newFeatureId => {
    // selectedReqs.forEach(req => {
    //   put(`/requirements/${req.id}`, {
    //     ...req,
    //     reqgroup_id: newFeatureId
    //   });
    // });
  };
  const changeStatus = async () => {
    modalContent.set(ChangeStatusModal);
    modalProps.set({ selectedReqs, update });
  };
  const changePriority = async () => {
    modalContent.set(ChangePriorityModal);
    modalProps.set({ selectedReqs, update });
  };
  const archiveSelected = async () => {};
  const deleteSelected = async () => {};
</script>

<style>
  .rotate90 {
    transform: rotate(90deg);
  }

  div.selectTools {
    background-color: var(--offwhite1);
    border-bottom: 0.1rem solid var(--grey1);
    margin: 0 -1.5rem;
    padding: 0 1.5rem;
    opacity: 1;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    overflow-x: auto;
  }

  div.selectTools > * {
    margin: 0.75rem 0;
  }

  div.selectTools > div.selectToolsLabel {
    line-height: 1.5rem;
    font-size: 1.5rem;
    font-weight: 600;
    margin-right: 0.5rem;
  }
  div.selectTools > div.buttons {
    display: flex;
    align-items: center;
  }

  div.selectTools > div.buttons > * {
    margin-right: 0.5rem;
    margin-top: 0;
  }
</style>

{#if selectedReqs.length}
  <div class="selectTools">
    <div class="selectToolsLabel">
      {selectedReqs.length} requirement{selectedReqs.length === 1 ? '' : 's'}:
    </div>
    <div class="buttons">
      <button
        on:click={moveToFeature}
        class="button-small button-outline button-clear button-secondary">
        <div class="iconWrapper rotate90">
          <FaExchangeAlt />
        </div>
        Move to feature
      </button>
      <button
        on:click={changeStatus}
        class="button-small button-outline button-clear button-secondary">
        <div class="iconWrapper">
          <FaEdit />
        </div>
        Change status
      </button>
      <button
        on:click={changePriority}
        class="button-small button-outline button-clear button-secondary">
        <div class="iconWrapper">
          <FaEdit />
        </div>
        Change priority
      </button>
      <button
        on:click={archiveSelected}
        class="button-small button-outline button-clear button-secondary">
        <div class="iconWrapper">
          <FaArchive />
        </div>
        Archive
      </button>
      <button
        on:click={deleteSelected}
        class="button-small button-outline button-clear button-secondary">
        <div class="iconWrapper">
          <FaRegTrashAlt />
        </div>
        Delete
      </button>
    </div>
  </div>
{/if}
