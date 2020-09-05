<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../../api";
  import AddRequirementToPromptModal from "../../../../../../components/AddRequirementToPromptModal.svelte";
  import AddReqgroupToPromptModal from "../../../../../../components/AddReqgroupToPromptModal.svelte";
  import RequirementWithButtons from "../../../../../../components/RequirementWithButtons.svelte";
  import Reqgroup from "../../../../../../components/Reqgroup.svelte";
  import { modalProps, modalContent } from "../../../../../../stores";

  const { page, session } = stores();
  const { promptId, id } = $page.params;

  const update = async () => {
    requirements = get(
      `/prompts/${promptId}/linked`,
      $session.user && $session.user.jwt
    );
  };

  let requirements = get(
    `/prompts/${promptId}/linked`,
    $session.user && $session.user.jwt
  );

  const addRequirement = () => {
    modalContent.set(AddRequirementToPromptModal);
    modalProps.set({ projectId: id, promptId, update });
  };

  const addReqgroup = () => {
    modalContent.set(AddReqgroupToPromptModal);
    modalProps.set({ projectId: id, promptId, update });
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<section class="contentWrapper">
  <h2>Requirements linked to prompt</h2>
  <button class="button button-success" on:click={addRequirement}>
    Add requirement
  </button>
  <button class="button button-success" on:click={addReqgroup}>
    Add requirement group
  </button>
</section>
{#await requirements}
  <!-- loading -->
{:then result}
  <section class="contentWrapper">
    {#if result.length}
      {#each result as req (`${req.entityType}-${req.id}`)}
        {#if req.entityType === 'requirement'}
          <ul class="panel">
            <RequirementWithButtons
              {update}
              unlinkId={promptId}
              unlinkType="prompt"
              requirement={req} />
          </ul>
        {:else}
          <Reqgroup
            reqgroup={req}
            {update}
            unlinkId={promptId}
            unlinkType="prompt" />
        {/if}
      {/each}
    {:else}
      <div class="secondary">No requirements linked</div>
    {/if}
  </section>
{:catch error}
  <section class="contentWrapper">
    <p style="color: var(--red)">{error.message}</p>
  </section>
{/await}
