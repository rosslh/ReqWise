<script>
  import { stores } from "@sapper/app";
  import { getContext } from "svelte";
  import { get, del } from "../../../../api.js";
  import { modalContent, modalProps } from "../../../../stores.js";
  import StakeholderInvitationsModal from "../../../../components/StakeholderInvitationsModal.svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  const update = async () => {
    externalStakeholders = await get(
      `/projects/${id}/external-stakeholders`,
      $session.user && $session.user.jwt
    );
  };

  const viewInvitations = () => {
    modalContent.set(StakeholderInvitationsModal);
    modalProps.set({ update, projectId: id });
  };

  const scopes = getContext("scopes");

  let externalStakeholders = get(
    `/projects/${id}/external-stakeholders`,
    $session.user && $session.user.jwt
  );

  const removeStakeholder = async (id) => {
    await del(
      `/external-stakeholders/${id}`,
      $session.user && $session.user.jwt
    );
    await update();
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<section class="contentWrapper">
  <h2>External Stakeholders</h2>
  {#if scopes.includes('member')}
    <button class="button-success" on:click={viewInvitations}>
      Invite external stakeholder
    </button>
  {/if}
</section>
<section class="contentWrapper">
  {#await externalStakeholders}
    <!-- loading -->
  {:then result}
    {#if result.length}
      <table class="compact">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {#each result as stakeholder}
            <tr>
              <td>{stakeholder.name}</td>
              <td>{stakeholder.email}</td>
              <td>
                <button
                  on:click={() => removeStakeholder(stakeholder.id)}
                  class="button-danger button-small button-outline">
                  Remove from project
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <div class="secondary">No external stakeholders</div>
    {/if}
  {/await}
</section>
