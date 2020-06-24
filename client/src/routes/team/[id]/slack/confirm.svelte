<script context="module">
  export async function preload(page) {
    const { code } = page.query;
    const { id } = page.params;
    return { code, id };
  }
</script>

<script>
  import { stores, goto } from "@sapper/app";
  import { onMount } from "svelte";
  import { put } from "../../../../api";
  import SubmitButton from "../../../../components/SubmitButton.svelte";

  export let code;
  export let id;

  const { session } = stores();

  onMount(async () => {
    await put(
      `/teams/${id}/slack`,
      { code, redirect_uri: `https://reqwise.com/team/${id}/slack/confirm` },
      $session.user && $session.user.jwt
    );
    goto(`/team/${id}`);
  });
</script>

<svelte:head>
  <title>Completing Slack integration</title>
</svelte:head>
<div class="contentWrapper">
  <h1>Connecting to Slack</h1>
  <div class="panel">Loading. Please wait.</div>
</div>
