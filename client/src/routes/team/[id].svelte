<script context="module">
  export async function preload({ params, path }, { user }) {
    if (!user) {
      return this.redirect(302, `/login?redirect=${encodeURIComponent(path)}`);
    }
    const team = await get(`/teams/${params.id}`, user && user.jwt);
    const { name, description, isAdmin } = team;
    const title = name;
    return { name, title, description, isAdmin, id: params.id, user };
  }
</script>

<script>
  import { stores, goto } from "@sapper/app";

  import { modalContent, modalProps } from "../../stores.js";
  import { get, put, del } from "../../api.js";
  const { session } = stores();

  import AddProjectModal from "../../components/AddProjectModal.svelte";
  import InviteTeamMemberModal from "../../components/InviteTeamMemberModal.svelte";
  import Spinner from "../../components/Spinner.svelte";

  export let id;
  export let user;

  export let name = "";
  export let description = "";
  export let isAdmin = false;
  export let title = "";

  let projects = get(`/teams/${id}/projects`, user && user.jwt);
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
    color: var(--secondaryText);
  }
</style>

<svelte:head>
  <title>{name} - ReqWise</title>
</svelte:head>
<div class="contentWrapper">
  <h1>{title}</h1>
  <section>
    <form>
      <fieldset>
        <label for="name">Team name</label>
        <input id="name" type="text" bind:value={name} />
      </fieldset>
      <fieldset>
        <label for="description">Description</label>
        <input id="description" type="text" bind:value={description} />
      </fieldset>
      <button on:click|preventDefault={updateTeam}>Update</button>
    </form>
  </section>
  <section>
    <h2>Projects</h2>
    {#await projects}
      <section class="contentWrapper">
        <Spinner />
      </section>
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
                <a href={`/project/${project.id}`}>{project.name}</a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:catch error}
      <section class="contentWrapper">
        <p style="color: red">{error.message}</p>
      </section>
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
  </section>
  <section>
    <h2>Members</h2>
    {#await members}
      <section class="contentWrapper">
        <Spinner />
      </section>
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
                    {/if}
                  {:else}(You){/if}
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    {:catch error}
      <section class="contentWrapper">
        <p style="color: red">{error.message}</p>
      </section>
    {/await}
    <h3>Invites</h3>
    {#await invites}
      <section class="contentWrapper">
        <Spinner />
      </section>
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
    {:catch error}
      <section class="contentWrapper">
        <p style="color: red">{error.message}</p>
      </section>
    {/await}
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
