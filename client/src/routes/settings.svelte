<script context="module">
  export async function preload(page, session) {
    if (!session.user) {
      return this.redirect(
        302,
        `/login?redirect=${encodeURIComponent(page.path)}`
      );
    }
    const user = await get(
      `/users/${session.user.id}`,
      session.user && session.user.jwt
    );
    return { user };
  }
</script>

<script>
  import { get, put } from "../api.js";

  import { goto, stores } from "@sapper/app";
  const { session, page } = stores();
  import { onMount } from "svelte";

  export let user;
  let name = "";
  let darkModeEnabled = false;

  onMount(() => {
    ({ name, darkModeEnabled } = user);
  });

  const submit = async () => {
    await put(
      `/users/${$session.user.id}/settings`,
      { name, darkModeEnabled },
      $session.user && $session.user.jwt
    );
    fetch("auth/changeTheme", {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify({ darkModeEnabled }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(r => r.json())
      .then(r => {
        $session.user = {
          ...$session.user,
          darkModeEnabled
        };
        goto(`/settings`, { replaceState: true });
      });
  };
</script>

<style>
  .changePassword {
    margin-top: 2rem;
  }
</style>

<div class="contentWrapper">
  <h2>Settings</h2>
  <fieldset>
    <label for="name">Your name</label>
    <input bind:value={name} type="text" id="name" />
  </fieldset>
  <fieldset>
    <input
      type="checkbox"
      id="darkModeEnabled"
      bind:checked={darkModeEnabled} />
    <label class="label-inline" for="darkModeEnabled">Enable dark theme</label>
  </fieldset>
  <button on:click={submit}>Submit</button>
</div>
<div class="contentWrapper changePassword">
  <a href="/reset/request">Change password</a>
</div>
