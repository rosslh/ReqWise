<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../api.js";
  import { modalContent, modalProps } from "../../../stores.js";
  import AddStakeholderGroupModal from "../../../components/AddStakeholderGroupModal.svelte";
  import StakeholderGroup from "../../../components/StakeholderGroup.svelte";

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
</script>

<section class="contentWrapper">
  <h2>Stakeholders</h2>
  <p class="infoBlurb">
    A stakeholder is an individual, group, or organization that is actively
    involved in a project, is affected by its process or outcome, or can
    influence its process or outcome. Some examples might be the product owners,
    developers, or customers.
  </p>
  <button class="button-success" on:click={createStakeholderGroup}>
    Add stakeholder group
  </button>
</section>
<section class="contentWrapper">
  {#await stakeholders then result}
    {#each result as stakeholderGroup (stakeholderGroup.id)}
      <StakeholderGroup group={stakeholderGroup} {update} />
    {/each}
  {/await}
</section>
