<script context="module">
  export async function preload({ params, path }, { user }) {
    if (!user) {
      return this.redirect(302, `/login?redirect=${encodeURIComponent(path)}`);
    }
    const team = await get(`/teams/${params.id}`, user && user.jwt);
    const { name, description, isAdmin } = team;
    const title = name;
    const projects = await get(
      `/teams/${params.id}/projects`,
      user && user.jwt
    );
    const members = await get(`/teams/${params.id}/members`, user && user.jwt);
    const invites = await get(`/teams/${params.id}/invites`, user && user.jwt);
    return { name, title, description, projects, members, invites, isAdmin };
  }
</script>

<script>
  import { stores, goto } from "@sapper/app";
  import { onMount } from "svelte";

  import { modalContent, modalProps, userId } from "../../stores.js";
  import { get, put, del } from "../../api.js";
  const { page, session } = stores();

  import AddProjectModal from "../../components/AddProjectModal.svelte";
  import InviteTeamMemberModal from "../../components/InviteTeamMemberModal.svelte";

  export let name = "";
  export let description = "";

  export let projects = null;
  export let members = null;
  export let invites = null;
  export let isAdmin = false;

  const { user } = $session;
  const { id } = $page.params;

  export let title = "";

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
    goto("/teams");
  };

  const deleteInvite = async inviteId => {
    await del(`/teams/${id}/invites/${inviteId}`, user && user.jwt);
    update();
  };

  const deleteMember = async memberId => {
    await del(`/teams/${id}/members/${memberId}`, user && user.jwt);
    update();
  };
</script>

<style>
  .userActions {
    color: var(--grey4);
  }
</style>

<div class="contentWrapper">
  <h1>{title}</h1>
  <section>
    <fieldset>
      <label for="name">Team name</label>
      <input id="name" type="text" bind:value={name} />
    </fieldset>
    <fieldset>
      <label for="description">Description</label>
      <input id="description" type="text" bind:value={description} />
    </fieldset>
    <div>
      <button on:click={updateTeam}>Update</button>
    </div>
  </section>
  <section>
    <h2>Projects</h2>
    <table class="compact">
      <thead>
        <tr>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        {#each projects as project (project.id)}
          <tr>
            <td>
              <a href={`/project/${project.id}`}>{project.name}</a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
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
  </section>
  <section>
    <h2>Members</h2>
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
        {#each members as member (member.id)}
          <tr>
            <td>{member.name}</td>
            <td>{member.email}</td>
            <td>{member.isAdmin}</td>
            <td>{member.isOwner}</td>
            {#if isAdmin}
              <td class="userActions">
                {#if member.id !== $userId}
                  {#if !member.isOwner}
                    <button
                      class="button-danger button-small button-outline"
                      style="margin: 0;"
                      on:click={() => deleteMember(member.id)}>
                      Remove member
                    </button>
                  {/if}
                {:else}(You){/if}
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
    <h3>Invites</h3>
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
        {#each invites as invite (invite.id)}
          <tr>
            <td>{invite.inviteeEmail}</td>
            <td>{invite.isAdmin}</td>
            {#if isAdmin}
              <td>
                <button
                  class="button-danger button-small button-outline"
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
    {#if isAdmin}
      <div>
        <button
          on:click={() => {
            modalContent.set(InviteTeamMemberModal);
            modalProps.set({ id, update });
          }}
          class="button-create">
          Invite member
        </button>
      </div>
    {/if}
  </section>
  {#if isAdmin}
    <section>
      <h2>Danger Zone</h2>
      <button class="button-danger" on:click={deleteTeam}>Delete team</button>
    </section>
  {/if}
</div>
