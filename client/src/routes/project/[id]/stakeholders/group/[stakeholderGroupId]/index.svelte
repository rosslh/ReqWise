<script>
  import { get } from "../../../../../../api.js";
  import { stores } from "@sapper/app";

  import StakeholderGroup from "../../../../../../components/StakeholderGroup.svelte";

  const { page, session } = stores();
  const { stakeholderGroupId, id } = $page.params;

  let stakeholderGroup = get(
    `/stakeholders/${stakeholderGroupId}`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    stakeholderGroup = await get(
      `/stakeholders/${stakeholderGroupId}`,
      $session.user && $session.user.jwt
    );
  };
</script>

<style>
  .stakeholderGroupPpuid {
    color: var(--secondaryText);
    font-weight: 300;
    margin-left: 1rem;
  }
</style>

<section class="contentWrapper">
  <h2>
    View stakeholder group
    {#await stakeholderGroup}
      <!-- loading -->
    {:then result}
      <span class="stakeholderGroupPpuid">#{result.ppuid}</span>
    {/await}
  </h2>
  {#await stakeholderGroup}
    <!-- loading -->
  {:then result}
    <StakeholderGroup group={result} {update} projectId={id} />
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
</section>
