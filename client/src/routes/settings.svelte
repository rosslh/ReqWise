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
  import Select from "svelte-select";

  import { get, put } from "../api.js";

  import { goto, stores } from "@sapper/app";
  const { session, page } = stores();
  import { onMount } from "svelte";

  export let user;
  let name = "";

  const capitalizeFirstLetter = str =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const themeOptions = ["light", "system", "dark"].map(attr => ({
    value: attr,
    label: capitalizeFirstLetter(attr)
  }));

  let theme = themeOptions[0];

  onMount(() => {
    ({ name } = user);
    theme = themeOptions.find(x => x.value === user.theme);
  });

  const submit = async () => {
    await put(
      `/users/${$session.user.id}/settings`,
      { name, theme: theme.value },
      $session.user && $session.user.jwt
    );
    fetch("auth/changeTheme", {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify({ theme: theme.value }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(r => r.json())
      .then(r => {
        $session.user = {
          ...$session.user,
          theme: theme.value
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
    <label for="theme">Interface theme</label>
    <Select
      inputAttributes={{ id: 'theme' }}
      items={themeOptions}
      bind:selectedValue={theme} />
  </fieldset>
  <button on:click={submit}>Submit</button>
</div>
<div class="contentWrapper changePassword">
  <a href="/reset/request">Change password</a>
</div>
