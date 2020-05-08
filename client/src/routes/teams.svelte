<script context="module">
  export async function preload(page, session) {
    if (!session.user) {
      return this.redirect(
        302,
        `/login?redirect=${encodeURIComponent(page.path)}`
      );
    }
    const teams = await get(
      `/users/${session.user.id}/teams`,
      session.user && session.user.jwt
    );
    const invites = await get(
      `/users/${session.user.id}/invites`,
      session.user && session.user.jwt
    );
    return { teams, invites };
  }
</script>

<script>
  import { get, post, del } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();
  import { modalContent, modalProps } from "../stores.js";
  import AddTeamModal from "../components/AddTeamModal.svelte";
  export let teams = [];
  export let invites = [];

  const update = async () => {
    teams = await get(
      `/users/${$session.user.id}/teams`,
      $session.user && $session.user.jwt
    );
    invites = await get(
      `/users/${$session.user.id}/invites`,
      $session.user && $session.user.jwt
    );
  };

  const acceptInvite = async inviteId => {
    await post(
      `/users/${$session.user.id}/teams`,
      {
        inviteId
      },
      $session.user.jwt
    );
    await update();
  };

  const deleteInvite = async inviteId => {
    await del(
      `/users/${$session.user.id}/invites/${inviteId}`,
      $session.user.jwt
    );
    await update();
  };

  const leaveTeam = async teamId => {
    await del(`/users/${$session.user.id}/teams/${teamId}`, $session.user.jwt);
    await update();
  };
</script>

<style>
  .membership {
    color: var(--secondaryText);
  }
</style>

<div class="contentWrapper">
  <h1>My Teams</h1>
  <table class="compact">
    <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th />
      </tr>
    </thead>
    <tbody>
      {#each teams as team (team.id)}
        <tr>
          <td>
            <a href={`/team/${team.id}`}>{team.name}</a>
          </td>
          <td>{team.description}</td>
          <td class="membership">
            {#if team.isOwner}
              (You own this team)
            {:else}
              <button
                class="button-danger button-small button-outline"
                style="margin: 0;"
                on:click={() => leaveTeam(team.id)}>
                Leave team
              </button>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <h2>Invites</h2>
  <table class="compact">
    <thead>
      <tr>
        <th>Team name</th>
        <th>Inviter name</th>
        <th />
        <th />
      </tr>
    </thead>
    <tbody>
      {#each invites as invite (invite.id)}
        <tr>
          <td>{invite.teamName}</td>
          <td>{invite.inviterName}</td>
          <td>
            <button
              class="button-success button-small button-outline"
              style="margin: 0;"
              on:click={() => acceptInvite(invite.id)}>
              Accept
            </button>
          </td>
          <td>
            <button
              class="button-danger button-small button-outline"
              style="margin: 0;"
              on:click={() => deleteInvite(invite.id)}>
              Delete
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <button
    class="button-create"
    on:click={() => {
      modalContent.set(AddTeamModal);
      modalProps.set({ update });
    }}>
    Create team
  </button>
</div>
