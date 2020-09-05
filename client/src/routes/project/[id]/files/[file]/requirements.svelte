<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../api";
  import AddRequirementToFileModal from "../../../../../components/AddRequirementToFileModal.svelte";
  import { modalProps, modalContent } from "../../../../../stores";

  const { page, session } = stores();
  const { file: fileId, id } = $page.params;

  const update = async () => {
    requirements = get(
      `/files/${fileId}/requirements`,
      $session.user && $session.user.jwt
    );
  };

  let requirements = get(
    `/files/${fileId}/requirements`,
    $session.user && $session.user.jwt
  );

  const addRequirement = () => {
    modalContent.set(AddRequirementToFileModal);
    modalProps.set({ projectId: id, fileId, update });
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<section class="contentWrapper">
  <h2>Requirements linked to file</h2>
  <button class="button button-success" on:click={addRequirement}>
    Add requirement
  </button>
</section>
{#await requirements}
  <!-- loading -->
{:then result}
  <section class="contentWrapper">
    {#if result.length}
      <ul>
        {#each result as req (req.id)}
          <li>
            <a
              rel="prefetch"
              href={`/project/${req.project_id}/requirement/${req.id}`}>
              #{req.ppuid}
              {req.description}
            </a>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="secondary">No requirements linked</div>
    {/if}
  </section>
{:catch error}
  <section class="contentWrapper">
    <p style="color: var(--red)">{error.message}</p>
  </section>
{/await}
