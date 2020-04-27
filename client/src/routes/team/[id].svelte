<script>
  import { stores, goto } from "@sapper/app";
  import { onMount } from "svelte";

  import { modalContent, modalProps, userId } from "../../stores.js";
  import { get, put, del } from "../../api.js";
  const { page } = stores();

  import AddProjectModal from "../../components/AddProjectModal.svelte";
  import InviteTeamMemberModal from "../../components/InviteTeamMemberModal.svelte";
  import Skeleton from "../../components/Skeleton.svelte";

  let name = "";
  let description = "";

  let projects = null;
  let members = null;
  let invites = null;
  let isAdmin = false;

  const { id } = $page.params;

  let title = "";

  const update = async () => {
    get(`/teams/${id}`).then(r => {
      ({ name, description, isAdmin } = r);
      title = name;
    });
    get(`/teams/${id}/projects`).then(r => {
      projects = r;
    });
    get(`/teams/${id}/members`).then(r => {
      members = r;
    });
    get(`/teams/${id}/invites`).then(r => {
      invites = r;
    });
  };

  const updateTeam = async () => {
    await put(`/teams/${id}`, { name, description })
      .then(() => {
        update();
      })
      .catch(() => alert("Failure"));
  };

  onMount(update);

  const deleteTeam = async () => {
    await del(`/teams/${id}`);
    goto("/teams");
  };

  const deleteInvite = async inviteId => {
    await del(`/teams/${id}/invites/${inviteId}`);
    update();
  };

  const deleteMember = async memberId => {
    await del(`/teams/${id}/members/${memberId}`);
    update();
  };
</script>

<style>
  .userActions {
    color: var(--grey4);
  }
</style>

<div class="contentWrapper">
  {#if title}
    <h1>{title}</h1>
  {:else}
    <Skeleton inline />
  {/if}
  <section>
    {#if name || description}
      <fieldset>
        <label for="name">Team name</label>
        <input id="name" type="text" bind:value={name} />
      </fieldset>
      <fieldset>
        <label for="description">Description</label>
        <input id="description" type="text" bind:value={description} />
      </fieldset>
    {:else}
      <Skeleton rows={2} />
    {/if}
    <div>
      <button on:click={updateTeam}>Update</button>
    </div>
  </section>
  <section>
    <h2>Projects</h2>
    {#if projects}
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
    {:else}
      <Skeleton rows={2} />
    {/if}
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
    {#if members}
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
    {:else}
      <Skeleton rows={3} />
    {/if}
    <h3>Invites</h3>
    {#if invites}
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
    {:else}
      <Skeleton rows={3} />
    {/if}
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
