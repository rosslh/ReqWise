<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../api.js";
  import { modalContent, modalProps } from "../../../../stores.js";
  import AddStakeholderGroupModal from "../../../../components/AddStakeholderGroupModal.svelte";
  import SearchSortFilter from "../../../../components/SearchSortFilter.svelte";
  import StakeholderGroup from "../../../../components/StakeholderGroup.svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  let stakeholders = get(
    `/projects/${id}/stakeholders`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    stakeholders = await get(
      `/projects/${id}/stakeholders`,
      $session.user && $session.user.jwt
    );
  };

  const createStakeholderGroup = () => {
    modalContent.set(AddStakeholderGroupModal);
    modalProps.set({ id, update });
  };

  let searchResults = [];
</script>

<section class="contentWrapper">
  <h2>External Stakeholders</h2>
  <p class="infoBlurb">
    A stakeholder is an individual, group, or organization that is involved in
    or affected by a project's process or outcome. External stakeholders added
    to your project can fill out brainstorm questionnaires and sign-off on
    requirements.
  </p>
  <button class="button-success" on:click={createStakeholderGroup}>
    Invite external stakeholder
  </button>
  <button
    class="button-success button-outline"
    on:click={createStakeholderGroup}>
    Add stakeholder group
  </button>
</section>
<section class="contentWrapper">
  {#await stakeholders then result}
    <SearchSortFilter
      bind:searchResults
      list={result}
      searchKeys={['name', 'description']} />
    {#each searchResults.length ? searchResults : result as stakeholderGroup (stakeholderGroup.id)}
      <StakeholderGroup group={stakeholderGroup} {update} />
    {/each}
  {/await}
</section>
