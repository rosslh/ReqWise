<script context="module">
  export const preload = async (page, session) => {
    if (session.jwt) {
      const teams = await get(`/users/${session.userId}/teams`, session.jwt);
      const invites = await get(
        `/users/${session.userId}/invites`,
        session.jwt
      );
      return { teams, invites };
    }
    return { teams: [], invites: [] };
  };
</script>

<script>
  import { get, post, del } from "../api.js";
  import { goto, stores } from "@sapper/app";
  const { session } = stores();
  import { modalContent, modalProps } from "../stores.js";
  import Skeleton from "../components/Skeleton.svelte";
  import AddTeamModal from "../components/AddTeamModal.svelte";
  export let teams = null;
  export let invites = null;

  const update = async () => {
    teams = await get(`/users/${$session.userId}/teams`, $session.jwt);
    invites = await get(`/users/${$session.userId}/invites`, $session.jwt);
  };

  const acceptInvite = async inviteId => {
    await post(`/users/${$session.userId}/teams`, {
      inviteId
    });
    await update();
  };

  const deleteInvite = async inviteId => {
    await del(`/users/${$session.userId}/invites/${inviteId}`);
    await update();
  };

  const leaveTeam = async teamId => {
    await del(`/users/${$session.userId}/teams/${teamId}`);
    await update();
  };
</script>

<style>
  .membership {
    color: var(--grey4);
  }
</style>

<div class="contentWrapper">
  {JSON.stringify($session, null, 2)}
  <h1>My Teams</h1>
  {#if teams}
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
  {:else}
    <Skeleton rows={3} />
  {/if}
  <h2>Invites</h2>
  {#if invites}
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
  {:else}
    <Skeleton rows={3} />
  {/if}
  <button
    class="button-create"
    on:click={() => {
      modalContent.set(AddTeamModal);
      modalProps.set({ update });
    }}>
    Create team
  </button>
</div>
