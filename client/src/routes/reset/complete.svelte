<script context="module">
  // the (optional) preload function takes a
  // `{ path, params, query }` object and turns it into
  // the data we need to render the page
  export async function preload(page, session) {
    // the `slug` parameter is available because this file
    // is called [slug].svelte
    const { token, email } = page.query;

    return { token, email };
  }
</script>

<script>
  import { put, post } from "../../api";
  import { jwt, userId } from "../../stores";

  export let token;
  export let email;

  let password = "";

  const submit = async () => {
    await put(`/users/${encodeURIComponent(email)}/password`, {
      password,
      token
    });
    await post("/auth/token", { email, password })
      .then(r => {
        jwt.set(r.token);
        userId.set(r.userId);
        goto("/teams");
      })
      .catch(err => alert("Incorrect email or password"));
  };
</script>

<div class="contentWrapper">
  <h2>Complete password reset</h2>
  <label for="email">Email</label>
  <input autocomplete="email" value={email} type="email" disabled id="email" />
  <label for="pwd">New password</label>
  <input
    autocomplete="new-password"
    bind:value={password}
    type="password"
    id="pwd" />
  <button on:click={submit}>Submit</button>
</div>
