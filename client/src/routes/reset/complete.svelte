<script context="module">
  // the (optional) preload function takes a
  // `{ path, params, query }` object and turns it into
  // the data we need to render the page
  export async function preload(page, _session) {
    // the `slug` parameter is available because this file
    // is called [slug].svelte
    const { token, email } = page.query;

    return { token, email };
  }
</script>

<script>
  import { goto } from "@sapper/app";
  import { put } from "../../api";

  export let token;
  export let email;

  let password = "";

  const submit = async () => {
    await put(`/users/${encodeURIComponent(email)}/password`, {
      password,
      token
    });
    goto("/login");
  };
</script>

<svelte:head>
  <title>Complete password reset - ReqWise</title>
</svelte:head>
<div class="contentWrapper">
  <h2>Complete password reset</h2>
  <form>
    <fieldset>
      <label for="email">Email</label>
      <input
        autocomplete="email"
        value={email}
        type="email"
        disabled
        id="email" />
      <label for="pwd">New password</label>
      <input
        autocomplete="new-password"
        bind:value={password}
        type="password"
        id="pwd" />
      <button on:click|preventDefault={submit}>Submit</button>
    </fieldset>
  </form>
</div>
