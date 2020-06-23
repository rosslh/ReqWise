<script>
  import { del, get } from "../../../api.js";
  import { stores, goto } from "@sapper/app";
  import { onMount } from "svelte";
  const { page, session } = stores();
  const { id } = $page.params;

  let team_id = null;

  onMount(async () => {
    ({ team_id } = await get(
      `/projects/${id}`,
      $session.user && $session.user.jwt
    ));
  });

  const deleteProject = async () => {
    await del(`/projects/${id}`, $session.user && $session.user.jwt).then(
      () => {
        goto(`/team/${team_id}`);
      }
    );
  };
</script>

<section class="contentWrapper">
  <h2>Integrations</h2>
  <div class="panel">
    <a
      href={`https://slack.com/oauth/v2/authorize?scope=${process.env.REQWISE_SLACK_SCOPES}&client_id=${process.env.REQWISE_SLACK_CLIENT_ID}`}>
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
  <div class="panel">
    <button on:click={deleteProject} class="button-danger">
      Delete project
    </button>
  </div>
</section>
