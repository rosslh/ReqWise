<script>
  import { stores } from "@sapper/app";
  import Select from "svelte-select";

  export let close;
  export let update;
  export let projectId;

  import { get, post, del } from "../api";
  import SubmitButton from "./SubmitButton.svelte";

  const { session } = stores();

  let invitations = get(
    `/projects/${projectId}/invites`,
    $session.user && $session.user.jwt
  );
  const stakeholderGroups = get(
    `/projects/${projectId}/stakeholders`,
    $session.user && $session.user.jwt
  );

  let inviteeEmail = "";
  let selectedGroup;

  const submitInvite = async () => {
    await post(
      `/projects/${projectId}/invites`,
      {
        inviteeEmail,
        stakeholderGroup_id: selectedGroup && selectedGroup.value,
      },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };

  const getOptions = (list) => {
    return list.map((x) => ({ label: x.name, value: x.id }));
  };

  const deleteInvitation = async (id) => {
    await del(
      `/projects/${projectId}/invites/${id}`,
      $session.user && $session.user.jwt
    );
    invitations = await get(
      `/projects/${projectId}/invites`,
      $session.user && $session.user.jwt
    );
  };
</script>

<style>
  div.noInvitations {
    margin-bottom: 1.5rem;
    color: var(--secondaryText);
  }

  .noStakeholderGroup {
    color: var(--secondaryText);
    font-style: italic;
  }
</style>

<h3>Invitations</h3>
{#await invitations}
  <!-- loading -->
{:then result}
  {#if result.length}
    <table class="compact">
      <thead>
        <tr>
          <th>Email</th>
          <th>Stakeholder group</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {#each result as inv}
          <tr>
            <td>{inv.inviteeEmail}</td>
            <td>
              {#if inv.name}
                {inv.name}
              {:else}
                <span class="noStakeholderGroup">Not categorized</span>
              {/if}
            </td>
            <td>
              <button
                on:click={() => deleteInvitation(inv.id)}
                class="button-danger button-small button-outline">
                Delete
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <div class="noInvitations">No pending invitations</div>
  {/if}
{/await}
<h4>New invitation</h4>
<form>
  <fieldset>
    <label for="email">Invitee email</label>
    <input type="email" id="email" bind:value={inviteeEmail} />
  </fieldset>
  <fieldset>
    <label for="group">Stakeholder group</label>
    {#await stakeholderGroups}
      loading
    {:then result}
      <Select
        inputAttributes={{ id: 'group' }}
        isClearable={false}
        items={getOptions(result)}
        bind:selectedValue={selectedGroup} />
    {:catch err}
      {err}
    {/await}
  </fieldset>
  <fieldset>
    <SubmitButton handler={submitInvite}>Invite</SubmitButton>
  </fieldset>
</form>
