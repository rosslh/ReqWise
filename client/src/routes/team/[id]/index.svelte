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
  import { format } from "date-fns";
  import FileSaver from "file-saver";
  import IoIosSettings from "svelte-icons/io/IoIosSettings.svelte";

  import { modalContent, modalProps } from "../../../stores.js";
  import { get, del, post } from "../../../api.js";
  const { session } = stores();

  import AddProjectModal from "../../../components/AddProjectModal.svelte";
  import AddProjectTemplateModal from "../../../components/AddProjectTemplateModal.svelte";
  import UploadProjectTemplateModal from "../../../components/UploadProjectTemplateModal.svelte";
  import EditTeamModal from "../../../components/EditTeamModal.svelte";
  import DeleteTemplateModal from "../../../components/DeleteTemplateModal.svelte";
  import InviteTeamMemberModal from "../../../components/InviteTeamMemberModal.svelte";
  import Skeleton from "../../../components/Skeleton.svelte";

  export let id;
  export let user;

  export let name = "";
  export let description = "";
  export let isAdmin = false;
  export let title = "";

  export let projects;

  let projectTemplates = get(
    `/teams/${id}/project-templates`,
    user && user.jwt
  );

  let members = get(`/teams/${id}/members`, user && user.jwt);
  let invites = get(`/teams/${id}/invites`, user && user.jwt);

  const update = async () => {
    get(`/teams/${id}`, user && user.jwt).then((r) => {
      ({ name, description, isAdmin } = r);
      title = name;
    });
    get(`/teams/${id}/projects`, user && user.jwt).then((r) => {
      projects = r;
    });
    get(`/teams/${id}/members`, user && user.jwt).then((r) => {
      members = r;
    });
    get(`/teams/${id}/invites`, user && user.jwt).then((r) => {
      invites = r;
    });
    get(`/teams/${id}/project-templates`, user && user.jwt).then((r) => {
      projectTemplates = r;
    });
  };

  const deleteTeam = async () => {
    await del(`/teams/${id}`, user && user.jwt);
    goto("/account");
  };

  const deleteInvite = async (inviteId) => {
    await del(`/teams/${id}/invites/${inviteId}`, user && user.jwt);
    update();
  };

  const deleteMember = async (memberId) => {
    await del(`/teams/${id}/members/${memberId}`, user && user.jwt);
    update();
  };

  const makeAdmin = async (accountId) => {
    await post(`/teams/${id}/admins`, { accountId }, user && user.jwt);
    update();
  };

  const removeAdmin = async (memberId) => {
    await del(`/teams/${id}/admins/${memberId}`, user && user.jwt);
    update();
  };

  const editTeam = async () => {
    modalContent.set(EditTeamModal);
    modalProps.set({ name, description, update, teamId: id });
  };

  const downloadData = (template) => {
    var blob = new Blob([template.data], {
      type: "text/plain;charset=utf-8",
    });
    FileSaver.saveAs(blob, `${encodeURIComponent(template.name)}.rqw`);
  };

  const newProjectFromTemplate = async ({ id: templateId }) => {
    setTimeout(function () {
      alert(
        "Creating a project from a template takes a moment. Please check back in a few minutes."
      );
    }, 1); // don't block
    await post(
      `/teams/${id}/projects/from-template`,
      { templateId },
      $session.user && $session.user.jwt
    );
    await update();
  };

  const deleteTemplate = async (template) => {
    modalContent.set(DeleteTemplateModal);
    modalProps.set({ update, template });
  };
</script>

<style>
  .userActions {
    color: var(--secondaryText);
  }

  .headingWrapper {
    display: flex;
    align-items: center;
  }

  .headingWrapper #settingsButton {
    margin-left: 1.5rem;
    border: none;
    padding: 0;
    margin-top: 0.5rem;
  }

  .settingsIconWrapper {
    height: 2.5rem;
    width: 2.5rem;
  }
  :global(.settingsIconWrapper svg) {
    max-height: 2.5rem;
    max-width: 2.5rem;
  }
</style>

<svelte:head>
  <title>{name} - ReqWise</title>
</svelte:head>
<div class="contentWrapper">
  <div class="headingWrapper">
    <h1>{title}</h1>
    <button
      id="settingsButton"
      on:click={editTeam}
      class="button button-secondary button-outline">
      <span class="settingsIconWrapper">
        <IoIosSettings />
      </span>
    </button>
  </div>
  <h2>Projects</h2>
  <div class="panel compact">
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
              <a
                rel="prefetch"
                class="projectLink"
                href={`/project/${project.id}/features`}>
                {project.name}
              </a>
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
  </div>
  <h2>Project templates</h2>
  <div class="panel compact">
    {#await projectTemplates}
      <Skeleton rows={3} />
    {:then result}
      <table class="compact">
        <thead>
          <tr>
            <th>Name</th>
            <th>Created at</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {#each result as template (template.id)}
            <tr>
              <td>{template.name}</td>
              <td>
                <time datetime={template.created_at} class="date">
                  {format(new Date(template.created_at), 'h:mm a, MMMM d, yyyy')}
                </time>
              </td>
              <td>
                <button
                  on:click={() => {
                    newProjectFromTemplate(template);
                  }}
                  class="button button-small button-primary">
                  New project from template
                </button>
                <button
                  on:click={() => {
                    downloadData(template);
                  }}
                  class="button button-small button-secondary button-outline">
                  Download
                </button>
                <button
                  on:click={() => {
                    deleteTemplate(template);
                  }}
                  class="button button-small button-outline button-danger">
                  Delete
                </button>
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
              modalContent.set(AddProjectTemplateModal);
              modalProps.set({ id, update, projects });
            }}>
            Create template
          </button>
          <button
            class="button-secondary button-outline"
            on:click={() => {
              modalContent.set(UploadProjectTemplateModal);
              modalProps.set({ id, update, projects, teamId: id });
            }}>
            Upload template
          </button>
        </div>
      {/if}
    {/await}
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
