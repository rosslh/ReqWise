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
    const projects = await get(
      `/users/${session.user.id}/projects`,
      session.user && session.user.jwt
    );
    return { teams, projects };
  }
</script>

<script>
  import { get, post, del } from "../../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();
  import { modalContent, modalProps } from "../../stores.js";
  import AddTeamModal from "../../components/AddTeamModal.svelte";

  export let teams;
  export let projects;

  let invites = get(
    `/users/${$session.user.id}/invites`,
    $session.user && $session.user.jwt
  );

  let feedbackRequests = get(
    `/users/${$session.user.id}/feedback-requests`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    teams = await get(
      `/users/${$session.user.id}/teams`,
      $session.user && $session.user.jwt
    );
    projects = await get(
      `/users/${$session.user.id}/projects`,
      $session.user && $session.user.jwt
    );
    invites = await get(
      `/users/${$session.user.id}/invites`,
      $session.user && $session.user.jwt
    );
    feedbackRequests = get(
      `/users/${$session.user.id}/feedback-requests`,
      $session.user && $session.user.jwt
    );
  };

  const acceptInvite = async ({ id: inviteId, projectName }) => {
    if (projectName) {
      await post(
        `/users/${$session.user.id}/projects`,
        {
          inviteId,
        },
        $session.user.jwt
      );
    } else {
      await post(
        `/users/${$session.user.id}/teams`,
        {
          inviteId,
        },
        $session.user.jwt
      );
    }
    await update();
  };

  const deleteInvite = async (inviteId, projectName) => {
    if (projectName) {
      await del(
        `/users/${$session.user.id}/project-invites/${inviteId}`,
        $session.user.jwt
      );
    } else {
      await del(
        `/users/${$session.user.id}/team-invites/${inviteId}`,
        $session.user.jwt
      );
    }
    await update();
  };

  const leaveTeam = async (teamId) => {
    await del(`/users/${$session.user.id}/teams/${teamId}`, $session.user.jwt);
    await update();
  };
</script>

<style>
  .membership {
    color: var(--secondaryText);
  }

  td.feedbackType {
    text-transform: capitalize;
  }
</style>

<svelte:head>
  <title>Account - ReqWise</title>
</svelte:head>
<div class="contentWrapper">
  {#await feedbackRequests}
    <!-- loading -->
  {:then result}
    {#if result.length}
      <h2>Feedback requested</h2>
      <div class="panel compact">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Feedback type</th>
            </tr>
          </thead>
          <tbody>
            {#each result as request (request.id)}
              <tr>
                <td>
                  <a
                    rel="prefetch"
                    href={`/public-form/${request.brainstormForm_id}`}
                    data-cy="feedbackRequest">
                    {request.description}</a>
                </td>
                <td class="feedbackType">{request.type}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/await}
  {#if projects.length}
    <h2>Project collaboration</h2>
    <div class="panel compact" data-cy="projectCollaboration">
      <table>
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {#each projects as project (project.id)}
            <tr>
              <td>
                <a
                  data-cy="projectLink"
                  rel="prefetch"
                  class="projectLink"
                  href={`/project/${project.id}`}>
                  {project.name}
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
  {#await invites}
    <!-- loading -->
  {:then result}
    {#if result.length}
      <h2>Invites</h2>
      <div class="panel compact">
        <table>
          <thead>
            <tr>
              <th>Team name</th>
              <th>Inviter name</th>
              <th />
              <th />
            </tr>
          </thead>
          <tbody>
            {#each result as invite (invite.id)}
              <tr>
                <td>
                  {invite.teamName}
                  {#if invite.projectName}/ {invite.projectName}{/if}
                </td>
                <td>{invite.inviterName}</td>
                <td>
                  <button
                    class="button-success button-small button-outline"
                    style="margin: 0;"
                    on:click={() => acceptInvite(invite)}>
                    Accept
                  </button>
                </td>
                <td>
                  <button
                    class="button-danger button-small button-outline"
                    style="margin: 0;"
                    on:click={() => deleteInvite(invite.id, invite.projectName)}>
                    Delete
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/await}
  <h2>My Teams</h2>
  <div class="panel compact">
    <table>
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
              <a rel="prefetch" class="teamLink" href={`/team/${team.id}`}>
                {team.name}
              </a>
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
    <button
      class="button-create"
      id="createTeamButton"
      on:click={() => {
        modalContent.set(AddTeamModal);
        modalProps.set({ update });
      }}>
      Create team
    </button>
  </div>
</div>
