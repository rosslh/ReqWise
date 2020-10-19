<script>
  import { get } from "../../../../../api.js";
  import { stores } from "@sapper/app";

  import FilePreview from "../../../../../components/FilePreview.svelte";

  const { page, session } = stores();
  const { file: fileId, id } = $page.params;

  let file = get(`/files/${fileId}`, $session.user && $session.user.jwt);

  const update = async () => {
    file = await get(`/files/${fileId}`, $session.user && $session.user.jwt);
  };
</script>

<style>
  .filePpuid {
    color: var(--secondaryText);
    font-weight: 300;
    margin-left: 1rem;
  }
</style>

<section class="contentWrapper">
  <h2>
    View file
    {#await file}
      <!-- loading -->
    {:then result}
      <span class="filePpuid">#{result.ppuid}</span>
    {/await}
  </h2>
  {#await file}
    <!-- loading -->
  {:then result}
    <FilePreview
      comments={result.comments}
      showComments={true}
      file={result}
      {update}
      projectId={id} />
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
</section>
