<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../api.js";
  import Userclass from "../../../../../components/Userclass.svelte";
  import AddUserclassToRequirementModal from "../../../../../components/AddUserclassToRequirementModal.svelte";
  import { modalContent, modalProps } from "../../../../../stores.js";

  const { page, session } = stores();
  const { reqId, id } = $page.params;

  let userclasses = get(
    `/requirements/${reqId}/userclasses`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    userclasses = await get(
      `/requirements/${reqId}/userclasses`,
      $session.user && $session.user.jwt
    );
  };

  const addUserclass = () => {
    modalContent.set(AddUserclassToRequirementModal);
    modalProps.set({ projectId: id, requirementId: reqId, update });
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<section class="contentWrapper">
  <h2>User classes linked to requirement</h2>
  <button class="button button-success" on:click={addUserclass}>
    Add userclass
  </button>
</section>
{#await userclasses}
  <!-- loading -->
{:then result}
  <section class="contentWrapper">
    {#if result.length}
      {#each result as userclass (userclass.id)}
        <Userclass
          {userclass}
          {update}
          projectId={id}
          unlinkRequirement={reqId} />
      {/each}
    {:else}
      <div class="secondary">No userclasses linked</div>
    {/if}
  </section>
{:catch error}
  <section class="contentWrapper">
    <p style="color: var(--red)">{error.message}</p>
  </section>
{/await}
