<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../api.js";
  import BrainstormPrompt from "../../../../../components/BrainstormPrompt.svelte";
  import StakeholderGroup from "../../../../../components/StakeholderGroup.svelte";
  import AddStakeholderGroupToReqgroupModal from "../../../../../components/AddStakeholderGroupToReqgroupModal.svelte";
  import { modalContent, modalProps } from "../../../../../stores.js";
  import AddPromptToReqgroupModal from "../../../../../components/AddPromptToReqgroupModal.svelte";

  const { page, session } = stores();
  const { reqgroupId, id } = $page.params;

  let stakeholderGroups = get(
    `/reqgroups/${reqgroupId}/stakeholders`,
    $session.user && $session.user.jwt
  );

  let prompts = get(
    `/reqgroups/${reqgroupId}/prompts`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    prompts = await get(
      `/reqgroups/${reqgroupId}/prompts`,
      $session.user && $session.user.jwt
    );

    stakeholderGroups = await get(
      `/reqgroups/${reqgroupId}/stakeholders`,
      $session.user && $session.user.jwt
    );
  };

  const addStakeholderGroup = () => {
    modalContent.set(AddStakeholderGroupToReqgroupModal);
    modalProps.set({ projectId: id, reqgroupId, update });
  };

  const addPrompt = () => {
    modalContent.set(AddPromptToReqgroupModal);
    modalProps.set({ projectId: id, reqgroupId, update });
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
    margin-bottom: 1.5rem;
  }
</style>

<section class="contentWrapper">
  <h2>Items linked to requirement group</h2>
</section>
<section class="contentWrapper">
  <h3>Stakeholders</h3>
  {#await stakeholderGroups}
    <!-- loading -->
  {:then result}
    {#if result.length}
      {#each result as group (group.id)}
        <StakeholderGroup {group} {update} unlinkReqgroup={reqgroupId} />
      {/each}
    {:else}
      <div class="secondary">No stakeholders linked</div>
    {/if}
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
  <button class="button button-success" on:click={addStakeholderGroup}>
    Add stakeholder group
  </button>
</section>
<section class="contentWrapper">
  <h3>Brainstorm prompts</h3>
  {#await prompts}
    <!-- loading -->
  {:then result}
    {#if result.length}
      {#each result as prompt (prompt.id)}
        <BrainstormPrompt {prompt} {update} unlinkReqgroup={reqgroupId} />
      {/each}
    {:else}
      <div class="secondary">No prompts linked</div>
    {/if}
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
  <button class="button button-success" on:click={addPrompt}>Add prompt</button>
</section>
