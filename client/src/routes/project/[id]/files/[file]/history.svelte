<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../api";
  import FilePreview from "../../../../../components/FilePreview.svelte";

  const { page, session } = stores();
  const { file: fileId, id: projectId } = $page.params;

  let currentVersion = get(
    `/files/${fileId}`,
    $session.user && $session.user.jwt
  );

  let oldVersions = get(
    `/files/${fileId}/history`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    currentVersion = await get(
      `/files/${fileId}`,
      $session.user && $session.user.jwt
    );
    oldVersions = get(
      `/files/${fileId}/history`,
      $session.user && $session.user.jwt
    );
  };
</script>

<section class="contentWrapper">
  <h2>File history</h2>
</section>
<section class="contentWrapper">
  <h3>Latest version</h3>
  {#await currentVersion}
    <!-- loading -->
  {:then file}
    <FilePreview {file} baselineSourceId={fileId} {projectId} {update} />
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
</section>
<section class="contentWrapper">
  <h3>Reviewed versions</h3>
  {#await oldVersions}
    <!-- loading -->
  {:then result}
    {#each result as file (file.id)}
      <FilePreview {file} baselineSourceId={fileId} {projectId} {update} />
    {/each}
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
</section>
