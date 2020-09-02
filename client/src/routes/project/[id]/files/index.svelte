<script>
  import { stores } from "@sapper/app";
  import { getContext } from "svelte";
  import { get } from "../../../../api.js";
  import FilePreview from "../../../../components/FilePreview.svelte";
  import UploadFileModal from "../../../../components/UploadFileModal.svelte";
  import LinkResourceModal from "../../../../components/LinkResourceModal.svelte";
  import SearchSortFilter from "../../../../components/SearchSortFilter.svelte";
  import { modalContent, modalProps } from "../../../../stores.js";

  const { page, session } = stores();
  const { id } = $page.params;
  const scopes = getContext("scopes");

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

  const link = async () => {
    modalContent.set(LinkResourceModal);
    modalProps.set({ projectId: id, update });
  };

  let searchResults = [];
</script>

<section class="contentWrapper">
  <h2>Diagrams and Files</h2>
  <p class="infoBlurb">
    Visual models and diagrams provide a level of understanding and
    communication that goes beyond what textual representation of requirements
    can provide.
  </p>
  {#if scopes.includes('member')}
    <a
      rel="prefetch"
      href={`/project/${id}/files/create`}
      class="button"
      id="create-file-button">
      Draw Diagram
    </a>
    <button class="button button-outline button-secondary" on:click={upload}>
      Upload File
    </button>
    <button class="button button-outline button-secondary" on:click={link}>
      Link Resource
    </button>
  {/if}
</section>
{#await files}
  <!-- loading -->
{:then result}
  <section class="contentWrapper">
    <SearchSortFilter
      bind:searchResults
      list={result}
      searchKeys={['name', 'description']} />
    {#each searchResults as file (file.id)}
      <FilePreview projectId={id} {file} {update} />
    {/each}
  </section>
{:catch error}
  <section class="contentWrapper">
    <p style="color: var(--red)">{error.message}</p>
  </section>
{/await}
