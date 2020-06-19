<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../api.js";
  import StakeholderGroup from "../../../../../components/StakeholderGroup.svelte";
  import AddStakeholderGroupToReqgroupModal from "../../../../../components/AddStakeholderGroupToReqgroupModal.svelte";
  import { modalContent, modalProps } from "../../../../../stores.js";

  const { page, session } = stores();
  const { reqgroupId, id } = $page.params;

  let stakeholderGroups = get(
    `/reqgroups/${reqgroupId}/stakeholders`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    stakeholderGroups = await get(
      `/reqgroups/${reqgroupId}/stakeholders`,
      $session.user && $session.user.jwt
    );
  };

  const addStakeholderGroup = () => {
    modalContent.set(AddStakeholderGroupToReqgroupModal);
    modalProps.set({ projectId: id, reqgroupId, update });
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<section class="contentWrapper">
  <h2>Stakeholder groups linked to requirement</h2>
  <button class="button button-success" on:click={addStakeholderGroup}>
    Add stakeholder group
  </button>
</section>
{#await stakeholderGroups}
  <!-- loading -->
{:then result}
  <section class="contentWrapper">
    {#if result.length}
      {#each result as group (group.id)}
        <StakeholderGroup {group} {update} unlinkReqgroup={reqgroupId} />
      {/each}
    {:else}
      <div class="secondary">No stakeholders linked</div>
    {/if}
  </section>
{:catch error}
  <section class="contentWrapper">
    <p style="color: var(--red)">{error.message}</p>
  </section>
{/await}
