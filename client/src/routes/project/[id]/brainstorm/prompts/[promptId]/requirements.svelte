<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../../api.js";

  import AddRequirementToPromptModal from "../../../../../../components/AddRequirementToPromptModal.svelte";

  const { page, session } = stores();
  const { promptId, id } = $page.params;

  import { modalProps, modalContent } from "../../../../../../stores";

  const update = async () => {
    requirements = get(
      `/prompts/${promptId}/requirements`,
      $session.user && $session.user.jwt
    );
  };

  let requirements = get(
    `/prompts/${promptId}/requirements`,
    $session.user && $session.user.jwt
  );

  const addRequirement = () => {
    modalContent.set(AddRequirementToPromptModal);
    modalProps.set({ projectId: id, promptId, update });
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<section class="contentWrapper">
  <h2>Requirements linked to brainstorm prompt</h2>
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
            {#if req.entityType === 'reqgroup'}
              <a
                rel="prefetch"
                href={`/project/${req.project_id}/reqgroup/${req.id}`}>
                #{req.ppuid}
                {req.name} (requirement group)
              </a>
            {:else}
              <a
                rel="prefetch"
                href={`/project/${req.project_id}/requirement/${req.id}`}>
                #{req.ppuid}
                {req.description} (requirement)
              </a>
            {/if}
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
