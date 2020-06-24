<script context="module">
  export async function preload({ params, path }, { user }) {
    if (!user) {
      return this.redirect(302, `/login?redirect=${encodeURIComponent(path)}`);
    }
    const team = await get(`/teams/${params.id}`, user && user.jwt);
    const projects = await get(
      `/teams/${params.id}/projects`,
      user && user.jwt
    );
    const { name, description, isAdmin } = team;
    const title = name;
    return { name, title, description, isAdmin, id: params.id, user, projects };
  }
</script>

<script>
  import { stores, goto } from "@sapper/app";

  import { modalContent, modalProps } from "../../../stores.js";
  import { get, put, del, post } from "../../../api.js";
  const { session } = stores();

  import AddProjectModal from "../../../components/AddProjectModal.svelte";
  import InviteTeamMemberModal from "../../../components/InviteTeamMemberModal.svelte";
  import Skeleton from "../../../components/Skeleton.svelte";
  import SubmitButton from "../../../components/SubmitButton.svelte";

  export let id;
  export let user;

  export let name = "";
  export let description = "";
  export let isAdmin = false;
  export let title = "";

  export let projects;
  let members = get(`/teams/${id}/members`, user && user.jwt);
  let invites = get(`/teams/${id}/invites`, user && user.jwt);

  const update = async () => {
    get(`/teams/${id}`, user && user.jwt).then(r => {
      ({ name, description, isAdmin } = r);
      title = name;
    });
    get(`/teams/${id}/projects`, user && user.jwt).then(r => {
      projects = r;
    });
    get(`/teams/${id}/members`, user && user.jwt).then(r => {
      members = r;
    });
    get(`/teams/${id}/invites`, user && user.jwt).then(r => {
      invites = r;
    });
  };

  const updateTeam = async () => {
    await put(`/teams/${id}`, { name, description }, user && user.jwt)
      .then(() => {
        update();
      })
      .catch(() => alert("Failure"));
  };

  const deleteTeam = async () => {
    await del(`/teams/${id}`, user && user.jwt);
    goto("/account");
  };

  const deleteInvite = async inviteId => {
    await del(`/teams/${id}/invites/${inviteId}`, user && user.jwt);
    update();
  };

  const deleteMember = async memberId => {
    await del(`/teams/${id}/members/${memberId}`, user && user.jwt);
    update();
  };

  const makeAdmin = async accountId => {
    await post(`/teams/${id}/admins`, { accountId }, user && user.jwt);
    update();
  };

  const removeAdmin = async memberId => {
    await del(`/teams/${id}/admins/${memberId}`, user && user.jwt);
    update();
  };
</script>

<style>
  .userActions {
    color: var(--secondaryText);
  }
</style>

<svelte:head>
  <title>{name} - ReqWise</title>
</svelte:head>
<div class="contentWrapper">
  <h1>{title}</h1>
  <div class="panel compact">
    <form>
      <fieldset>
        <label for="name">Team name</label>
        <input id="name" type="text" bind:value={name} />
      </fieldset>
      <fieldset>
        <label for="description">Description</label>
        <input id="description" type="text" bind:value={description} />
      </fieldset>
      <SubmitButton handler={updateTeam}>Update</SubmitButton>
    </form>
  </div>
  <h2>Projects</h2>
  <div class="panel compact">
    {#await projects}
      <Skeleton rows={3} />
    {:then result}
      <table class="compact">
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {#each result as project (project.id)}
            <tr>
              <td>
                <a class="projectLink" href={`/project/${project.id}/features`}>
                  {project.name}
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:catch error}
      <p style="color: var(--red)">{error.message}</p>
    {/await}
    {#if isAdmin}
      <div>
        <button
          class="button-create"
          on:click={() => {
            modalContent.set(AddProjectModal);
            modalProps.set({ id, update });
          }}>
          Create project
        </button>
      </div>
    {/if}
  </div>
  <h2>Members</h2>
  <div class="panel compact">
    {#await members}
      <Skeleton rows={3} />
    {:then result}
      <table class="compact">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Is admin</th>
            <th>Is owner</th>
            {#if isAdmin}
              <th />
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each result as member (member.id)}
            <tr>
              <td>{member.name}</td>
              <td>{member.email}</td>
              <td>{member.isAdmin}</td>
              <td>{member.isOwner}</td>
              {#if isAdmin}
                <td class="userActions">
                  {#if member.id !== $session.user.id}
                    {#if !member.isOwner}
                      <button
                        class="button-danger button-small button-outline"
                        style="margin: 0;"
                        on:click={() => deleteMember(member.id)}>
                        Remove member
                      </button>
                      &nbsp;
                      {#if !member.isAdmin}
                        <button
                          class="button-caution button-small button-outline"
                          style="margin: 0;"
                          on:click={() => makeAdmin(member.id)}>
                          Make admin
                        </button>
                      {:else}
                        <button
                          class="button-caution button-small button-outline"
                          style="margin: 0;"
                          on:click={() => removeAdmin(member.id)}>
                          Remove as admin
                        </button>
                      {/if}
                    {/if}
                  {:else}(You){/if}
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    {:catch error}
      <p style="color: var(--red)">{error.message}</p>
    {/await}
  </div>
  <h3>Invites</h3>
  <div class="panel compact">
    {#await invites}
      <Skeleton rows={3} />
    {:then result}
      <table class="compact">
        <thead>
          <tr>
            <th>Email</th>
            <th>Is admin</th>
            {#if isAdmin}
              <th />
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each result as invite (invite.id)}
            <tr class="inviteeRow">
              <td class="inviteeEmail">{invite.inviteeEmail}</td>
              <td>{invite.isAdmin}</td>
              {#if isAdmin}
                <td>
                  <button
                    class="deleteInviteButton button-danger button-small
                    button-outline"
                    style="margin: 0;"
                    on:click={() => deleteInvite(invite.id)}>
                    Delete invite
                  </button>
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    {:catch error}
      <p style="color: var(--red)">{error.message}</p>
    {/await}
    {#if isAdmin}
      <div>
        <button
          id="inviteMemberButton"
          on:click={() => {
            modalContent.set(InviteTeamMemberModal);
            modalProps.set({ id, update });
          }}
          class="button-create">
          Invite member
        </button>
      </div>
    {/if}
  </div>
  {#if isAdmin}
    <h2>Integrations</h2>
    <div class="panel compact">
      <a
        href={`https://slack.com/oauth/v2/authorize?redirect_uri=${encodeURIComponent(`https://reqwise.com/team/${id}/slack/confirm`)}&scope=${process.env.REQWISE_SLACK_SCOPES}&client_id=${process.env.REQWISE_SLACK_CLIENT_ID}`}>
        <img
          alt="Add to Slack"
          height="40"
          width="139"
          src="https://platform.slack-edge.com/img/add_to_slack.png"
          srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x,
          https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
      </a>
    </div>
    <h2>Danger Zone</h2>
    <div class="panel compact">
      <button id="deleteTeamButton" class="button-danger" on:click={deleteTeam}>
        Delete team
      </button>
    </div>
  {/if}
</div>
