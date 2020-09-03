<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../api";
  import { modalContent, modalProps } from "../../../../../stores";
  import AddRequirementToUserclassModal from "../../../../../components/AddRequirementToUserclassModal.svelte";

  const { page, session } = stores();
  const { userclassId, id } = $page.params;

  const update = async () => {
    requirements = get(
      `/userclasses/${userclassId}/requirements`,
      $session.user && $session.user.jwt
    );
  };

  let requirements = get(
    `/userclasses/${userclassId}/requirements`,
    $session.user && $session.user.jwt
  );

  const addRequirement = () => {
    modalContent.set(AddRequirementToUserclassModal);
    modalProps.set({ projectId: id, userclassId, update });
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<section class="contentWrapper">
  <h2>Requirements linked to user class</h2>
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
