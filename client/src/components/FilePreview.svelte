<script>
  export let update;
  export let file;
  export let projectId;

  import { modalContent, modalProps } from "../stores.js";
  import EditFileDetailsModal from "../components/EditFileDetailsModal.svelte";
  import DeleteFileModal from "../components/DeleteFileModal.svelte";
  import UploadFileModal from "../components/UploadFileModal.svelte";

  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaLink from "svelte-icons/fa/FaLink.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import MdEdit from "svelte-icons/md/MdEdit.svelte";
  import MdFileDownload from "svelte-icons/md/MdFileDownload.svelte";
  import MdCloudUpload from "svelte-icons/md/MdCloudUpload.svelte";

  const editFileDetails = file => {
    modalContent.set(EditFileDetailsModal);
    modalProps.set({
      file,
      update
    });
  };
  const deleteFile = () => {
    modalContent.set(DeleteFileModal);
    modalProps.set({
      file,
      update
    });
  };
  const uploadNewVersion = async () => {
    modalContent.set(UploadFileModal);
    modalProps.set({
      projectId,
      update,
      file
    });
  };

  const isImageFile = fileName =>
    /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/.test(fileName);
</script>

<style>
  .filePreview {
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

  .fileButtonWrapper {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
  }
  .fileButton {
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

  .fileButton .fileIconWrapper {
    margin: 0;
    height: 1.8rem;
    width: 1.8rem;
  }

  .filePpuid {
    color: var(--secondaryText);
    font-weight: 300;
    margin-left: 0.5rem;
  }

  div.diagramWrapper img.uploadedImage {
    max-height: inherit;
    max-width: inherit;
  }
</style>

<div class="filePreview">
  <div class="diagramWrapper">
    {#if file.type === 'diagram'}
      <div class="fileButtonWrapper">
        <a
          title="Edit"
          href={`/project/${projectId}/files/${file.id}/edit`}
          class="button fileButton">
          <div class="fileIconWrapper">
            <MdEdit />
          </div>
        </a>
      </div>
      {@html file.svg}
    {:else if file.type === 'externalResource'}
      <a target="_blank" rel="noopener" href={file.url}>
        View external resource
      </a>
    {:else}
      <div class="fileButtonWrapper">
        <a
          title="Download"
          href={`https://storage.googleapis.com/user-file-storage/${file.fileName}`}
          download
          class="button fileButton">
          <div class="fileIconWrapper">
            <MdFileDownload />
          </div>
        </a>
        <button
          title="Upload new version"
          on:click={uploadNewVersion}
          class="button fileButton">
          <div class="fileIconWrapper">
            <MdCloudUpload />
          </div>
        </button>
      </div>
      {#if isImageFile(file.fileName)}
        <img
          class="uploadedImage"
          src={`https://storage.googleapis.com/user-file-storage/${file.fileName}`}
          alt={file.name} />
      {:else}
        <a
          target="_blank"
          rel="noopener"
          href={`https://storage.googleapis.com/user-file-storage/${file.fileName}`}>
          View file
        </a>
      {/if}
    {/if}
  </div>
  <div class="textContent">
    <h3>
      {file.name}
      <span class="filePpuid">#{file.ppuid}</span>
    </h3>
    <p>{file.description}</p>
  </div>
  <div class="footer">
    <button
      on:click={() => alert('view reqs')}
      class="button-outline button-small button-secondary button-clear">
      <div class="iconWrapper">
        <FaLink />
      </div>
      Requirements
    </button>
    <button
      on:click={() => editFileDetails(file)}
      class="button-outline button-small button-secondary button-clear">
      <div class="iconWrapper">
        <FaRegEdit />
      </div>
      Edit details
    </button>
    <button
      on:click={deleteFile}
      class="button-outline button-small button-secondary button-clear">
      <div class="iconWrapper">
        <FaRegTrashAlt />
      </div>
      Delete
    </button>
  </div>
</div>
