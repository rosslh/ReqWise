<script>
  export let update;
  export let model;
  import { modalContent, modalProps } from "../stores.js";
  import EditModelDetailsModal from "../components/EditModelDetailsModal.svelte";
  import DeleteModelModal from "../components/DeleteModelModal.svelte";

  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import MdEdit from "svelte-icons/md/MdEdit.svelte";

  const editModelDiagram = () => {};
  const editModelDetails = model => {
    modalContent.set(EditModelDetailsModal);
    modalProps.set({
      model,
      update
    });
  };
  const deleteModel = () => {
    modalContent.set(DeleteModelModal);
    modalProps.set({
      model,
      update
    });
  };
</script>

<style>
  .modelPreview {
    border: 0.1rem solid var(--borderColor);
    border-radius: 0.4rem;
    margin: 2rem 0;
    background-color: var(--background1);
    overflow: hidden;
  }

  .diagramWrapper {
    position: relative;
    min-height: 15rem;
    max-height: 30rem;
    width: 100%;
    background-color: var(--background2);
    border-bottom: 0.1rem solid var(--borderColor);
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :global(.diagramWrapper svg) {
    max-height: 30rem;
    max-width: 100%;
  }

  .textContent {
    padding: 2rem;
  }

  .textContent p {
    margin-bottom: 0;
  }

  .textContent h3 {
    margin-top: 0;
    font-size: 1.8rem;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    padding: 0 2rem 2rem;
  }

  .footer button {
    margin: 0;
  }
  button.editModelDiagram {
    position: absolute;
    top: 1rem;
    right: 1rem;
    border-radius: 50%;
    height: 2.8rem;
    width: 2.8rem;
    border: 0.1rem solid var(--borderColor);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0;
    background-color: var(--background1);
    color: var(--secondaryText);
  }

  button.editModelDiagram .iconWrapper {
    margin: 0;
    height: 1.8rem;
    width: 1.8rem;
  }
</style>

<div class="modelPreview">
  <div class="diagramWrapper">
    <button on:click={editModelDiagram} class="editModelDiagram">
      <div class="iconWrapper">
        <MdEdit />
      </div>
    </button>
    {@html model.svg}
  </div>
  <div class="textContent">
    <h3>{model.name}</h3>
    <p>{model.description}</p>
  </div>
  <div class="footer">
    <button
      on:click={() => editModelDetails(model)}
      class="button-outline button-small button-secondary button-clear">
      <div class="iconWrapper">
        <FaRegEdit />
      </div>
      Edit details
    </button>
    <button
      on:click={deleteModel}
      class="button-outline button-small button-secondary button-clear">
      <div class="iconWrapper">
        <FaRegTrashAlt />
      </div>
      Delete
    </button>
  </div>
</div>
