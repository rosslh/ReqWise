<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../api.js";
  import FilePreview from "../../../../components/FilePreview.svelte";
  import UploadFileModal from "../../../../components/UploadFileModal.svelte";
  import { modalContent, modalProps } from "../../../../stores.js";

  const { page, session } = stores();
  const { id } = $page.params;

  let files = get(`/projects/${id}/files`, $session.user && $session.user.jwt);

  const update = async () => {
    files = await get(
      `/projects/${id}/files`,
      $session.user && $session.user.jwt
    );
  };

  const upload = async () => {
    modalContent.set(UploadFileModal);
    modalProps.set({ projectId: id, update });
  };
</script>

<style>
  a#create-file-button {
    margin-right: 1.5rem;
  }
</style>

<section class="contentWrapper">
  <h2>Diagrams and Files</h2>
  <p class="infoBlurb">
    Visual models and diagrams provide a level of understanding and
    communication that goes beyond what textual representation of requirements
    can provide.
  </p>
  <a
    href={`/project/${id}/files/create`}
    class="button"
    id="create-file-button">
    Draw Diagram
  </a>
  <button class="button button-outline" on:click={upload}>Upload File</button>
</section>
{#await files}
  <!-- loading -->
{:then result}
  <section class="contentWrapper">
    {#each result as file (file.id)}
      <FilePreview projectId={id} {file} {update} />
    {/each}
  </section>
{:catch error}
  <section class="contentWrapper">
    <p style="color: var(--red)">{error.message}</p>
  </section>
{/await}
