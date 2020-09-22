<script>
  import { del, get, put } from "../../../api.js";
  import { stores, goto } from "@sapper/app";
  import { onMount, getContext } from "svelte";
  import SubmitButton from "../../../components/SubmitButton.svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  let team_id = null;
  let slackChannel = "";
  let projectName = "";
  let slackTeamId;

  onMount(async () => {
    await update();
  });

  const update = async () => {
    ({ team_id, slackChannelName: slackChannel, name: projectName } = await get(
      `/projects/${id}`,
      $session.user && $session.user.jwt
    ));

    ({ slackTeamId } = await get(
      `/teams/${team_id}`,
      $session.user && $session.user.jwt
    ));
  };

  const deleteProject = async () => {
    if (
      confirm(
        "Are you sure you want to delete this project? All associated data will be irrecoverable."
      )
    ) {
      await del(`/projects/${id}`, $session.user && $session.user.jwt).then(
        () => {
          goto(`/team/${team_id}`);
        }
      );
    }
  };

  const changeProjectName = async () => {
    await put(
      `/projects/${id}`,
      {
        name: projectName,
      },
      $session.user && $session.user.jwt
    );
    await update();
    location.reload();
  };

  const changeSlackChannel = async () => {
    if (/^[a-z0-9][a-z0-9_-]{1,79}$/.test(slackChannel)) {
      await put(
        `/projects/${id}`,
        {
          slackChannelName: slackChannel,
        },
        $session.user && $session.user.jwt
      );
      await update();
    } else {
      alert("Invalid channel name");
    }
  };

  const scopes = getContext("scopes");
</script>

<style>
  .warning {
    font-weight: 600;
    color: var(--orange);
    margin-top: 1.5rem;
  }

  input[type="text"]:invalid {
    border-color: var(--red);
  }
</style>

<section class="contentWrapper">
  <h2>Settings</h2>
  {#if scopes.includes('admin')}
    <div class="panel">
      <form>
        <fieldset>
          <label for="projectName">Project name</label>
          <input bind:value={projectName} id="projectName" type="text" />
        </fieldset>
        <SubmitButton handler={changeProjectName}>Save</SubmitButton>
      </form>
    </div>
    {#if slackTeamId}
      <h3>Slack</h3>
      <div class="panel">
        <form>
          <fieldset>
            <label for="slackChannel">Slack channel name</label>
            <input
              bind:value={slackChannel}
              id="slackChannel"
              pattern={'^[a-z0-9][a-z0-9_-]{1,79}$'}
              type="text" />
            <div class="warning">
              Careful! The channel cannot have the same name as your Slack
              workspace.
            </div>
          </fieldset>
          <SubmitButton handler={changeSlackChannel}>Save</SubmitButton>
        </form>
      </div>
    {/if}
    <h3>Danger zone</h3>
    <button on:click={deleteProject} class="button-danger">
      Delete project
    </button>
  {:else}
    <div class="panel">Only administrators can change project settings.</div>
  {/if}
</section>
