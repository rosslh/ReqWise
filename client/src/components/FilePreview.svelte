<script>
  export let update;
  export let file;
  export let projectId;
  export let unlinkRequirement;

  import { stores } from "@sapper/app";

  import { modalContent, modalProps } from "../stores.js";
  import { del } from "../api.js";
  import EditFileDetailsModal from "./EditFileDetailsModal.svelte";
  import DeleteFileModal from "./DeleteFileModal.svelte";
  import UploadFileModal from "./UploadFileModal.svelte";
  import StakeholderStatus from "./StakeholderStatus.svelte";

  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaLink from "svelte-icons/fa/FaLink.svelte";
  import FaUnlink from "svelte-icons/fa/FaUnlink.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import MdEdit from "svelte-icons/md/MdEdit.svelte";
  import MdFileDownload from "svelte-icons/md/MdFileDownload.svelte";
  import MdCloudUpload from "svelte-icons/md/MdCloudUpload.svelte";

  const { session } = stores();

  const editFileDetails = (file) => {
    modalContent.set(EditFileDetailsModal);
    modalProps.set({
      file,
      update,
    });
  };
  const deleteFile = () => {
    modalContent.set(DeleteFileModal);
    modalProps.set({
      file,
      update,
    });
  };
  const uploadNewVersion = async () => {
    modalContent.set(UploadFileModal);
    modalProps.set({
      projectId,
      update,
      file,
    });
  };

  const isImageFile = (fileName) =>
    /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(fileName);

  const unlinkFile = async () => {
    await del(
      `/files/${file.id}/requirements/${unlinkRequirement}`,
      $session.user && $session.user.jwt
    );
    await update();
  };
</script>

<style>
  .filePreview {
    box-shadow: var(--boxShadow);
    border-radius: 0.8rem;
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
    /* border-bottom: 0.1rem solid var(--borderColor); */
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
    padding: 0 1.5rem 2rem;
  }

  .textContent p {
    margin-bottom: 0;
  }

  .heading {
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
  }

  .heading h3 {
    margin-top: 0;
    font-size: 1.8rem;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    padding: 0 2rem 2rem;
  }

  .footer button,
  .footer .button {
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
    margin-left: 0.25rem;
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

  h3 a {
    text-decoration: none;
    color: var(--normalText);
  }

  h3 a:hover {
    text-decoration: underline;
  }
</style>

<div class="filePreview">
  <div class="diagramWrapper">
    {#if file.type === 'diagram'}
      <div class="fileButtonWrapper">
        <a
          rel="prefetch"
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
  <div class="heading">
    <h3>
      <a rel="prefetch" href={`/project/${projectId}/files/${file.id}`}>
        {file.name}
      </a>
      <span class="filePpuid">#{file.ppuid}</span>
    </h3>
    <StakeholderStatus
      isDraft={file.is_draft}
      latestReviewStatus={file.latestReviewStatus} />
  </div>
  <div class="textContent">
    <p>{file.description}</p>
  </div>
  <div class="footer">
    {#if unlinkRequirement}
      <button
        on:click={unlinkFile}
        class="button-outline button-small button-secondary button-clear">
        <div class="iconWrapper iconWrapper-padded">
          <FaUnlink />
        </div>
        Unlink file
      </button>
    {:else}
      <a
        rel="prefetch"
        href={`/project/${projectId}/files/${file.id}/requirements`}
        class="button button-outline button-small button-secondary button-clear">
        <div class="iconWrapper iconWrapper-padded">
          <FaLink />
        </div>
        Requirements
      </a>
    {/if}
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
