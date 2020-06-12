<script>
  export let update;
  export let model;
  export let projectId;

  import { modalContent, modalProps } from "../stores.js";
  import EditModelDetailsModal from "../components/EditModelDetailsModal.svelte";
  import DeleteModelModal from "../components/DeleteModelModal.svelte";

  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import MdEdit from "svelte-icons/md/MdEdit.svelte";
  import MdFileDownload from "svelte-icons/md/MdFileDownload.svelte";
  import MdCloudUpload from "svelte-icons/md/MdCloudUpload.svelte";

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

  const isImageFile = fileName =>
    /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/.test(fileName);
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
    overflow: hidden;
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

  .modelButtonWrapper {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
  }
  .modelButton {
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
    margin-left: 0.3rem;
  }

  .modelButton .modelIconWrapper {
    margin: 0;
    height: 1.8rem;
    width: 1.8rem;
  }

  .modelPpuid {
    color: var(--secondaryText);
    font-weight: 300;
    margin-left: 0.5rem;
  }

  div.diagramWrapper img.uploadedImage {
    max-height: inherit;
    max-width: inherit;
  }
</style>

<div class="modelPreview">
  <div class="diagramWrapper">
    {#if model.type === 'diagram'}
      <div class="modelButtonWrapper">
        <a
          title="Edit"
          href={`/project/${projectId}/models/${model.id}/edit`}
          class="button modelButton">
          <div class="modelIconWrapper">
            <MdEdit />
          </div>
        </a>
      </div>
      {@html model.svg}
    {:else}
      <div class="modelButtonWrapper">
        <button title="Download" on:click={() => {}} class="button modelButton">
          <div class="modelIconWrapper">
            <MdFileDownload />
          </div>
        </button>
        <button
          title="Upload new version"
          on:click={() => {}}
          class="button modelButton">
          <div class="modelIconWrapper">
            <MdCloudUpload />
          </div>
        </button>
      </div>
      {#if isImageFile(model.fileName)}
        <img
          class="uploadedImage"
          src={`https://storage.googleapis.com/user-file-storage/${model.fileName}`}
          alt={model.name} />
      {:else}
        <a
          target="_blank"
          rel="noopener"
          href={`https://storage.googleapis.com/user-file-storage/${model.fileName}`}>
          View file
        </a>
      {/if}
    {/if}
  </div>
  <div class="textContent">
    <h3>
      {model.name}
      <span class="modelPpuid">#{model.ppuid}</span>
    </h3>
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
