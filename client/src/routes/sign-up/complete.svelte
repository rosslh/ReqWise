<script context="module">
  import { setLoginParam } from "../../utils.js";
  export async function preload(page, { user }) {
    setLoginParam(page, user, this.redirect);

    const { token, email } = page.query;

    return { token, email };
  }
</script>

<script>
  import { goto, stores } from "@sapper/app";
  import { put } from "../../api";

  export let token;
  export let email;

  let name = "";
  let password = "";

  const { session } = stores();

  const submit = async () => {
    await put(`/users/${encodeURIComponent(email)}`, { name, password, token });
    fetch("auth/login", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(r => r.json())
      .then(r => {
        $session.user = { jwt: r.token, id: r.userId };
        goto("/teams");
      })
      .catch(() => alert("Incorrect email or password"));
  };
</script>

<svelte:head>
  <title>Complete sign up - ReqWise</title>
</svelte:head>
<div class="contentWrapper">
  <h2>Complete sign up</h2>
  <form>
    <fieldset>
      <label for="email">Email</label>
      <input
        autocomplete="email"
        value={email}
        type="email"
        disabled
        id="email" />
    </fieldset>
    <fieldset>
      <label for="name">Name</label>
      <input autocomplete="name" bind:value={name} type="text" id="name" />
    </fieldset>
    <fieldset>
      <label for="pwd">Password</label>
      <input
        autocomplete="new-password"
        bind:value={password}
        type="password"
        id="pwd" />
      <button on:click|preventDefault={submit}>Submit</button>
    </fieldset>
  </form>
</div>
