<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../api.js";
  import { modalContent, modalProps } from "../../../stores.js";
  import AddStakeholderGroupModal from "../../../components/AddStakeholderGroupModal.svelte";
  import StakeholderGroup from "../../../components/StakeholderGroup.svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  let models = get(
    `/projects/${id}/stakeholders`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    models = await get(
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
  <p class="infoBlurb">...</p>
  <button class="button-success" on:click={createStakeholderGroup}>
    Add stakeholder group
  </button>
</section>
<section class="contentWrapper">
  {#await models}
    <!-- loading -->
  {:then result}
    {#each result as stakeholderGroup (stakeholderGroup.id)}
      <StakeholderGroup group={stakeholderGroup} />
    {/each}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</section>
