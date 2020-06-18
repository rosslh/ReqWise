<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../api.js";
  import FilePreview from "../../../../../components/FilePreview.svelte";
  import AddFileToRequirementModal from "../../../../../components/AddFileToRequirementModal.svelte";
  import LinkResourceModal from "../../../../../components/LinkResourceModal.svelte";
  import SearchSortFilter from "../../../../../components/SearchSortFilter.svelte";
  import { modalContent, modalProps } from "../../../../../stores.js";

  const { page, session } = stores();
  const { reqId, id } = $page.params;

  let files = get(
    `/requirements/${reqId}/files`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    files = await get(
      `/requirements/${reqId}/files`,
      $session.user && $session.user.jwt
    );
  };

  const addFile = () => {
    modalContent.set(AddFileToRequirementModal);
    modalProps.set({ projectId: id, requirementId: reqId, update });
  };

  //   let searchResults = [];
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<section class="contentWrapper">
  <h2>Files linked to requirement</h2>
  <button class="button button-success" on:click={addFile}>Add file</button>
</section>
{#await files}
  <!-- loading -->
{:then result}
  <section class="contentWrapper">
    {#if result.length}
      {#each result as file (file.id)}
        <FilePreview {file} {update} unlinkRequirement={reqId} />
      {/each}
    {:else}
      <div class="secondary">No files linked</div>
    {/if}
  </section>
{:catch error}
  <section class="contentWrapper">
    <p style="color: var(--red)">{error.message}</p>
  </section>
{/await}
