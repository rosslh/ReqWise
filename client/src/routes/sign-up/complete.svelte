<script context="module">
  export async function preload(page) {
    const { token, email } = page.query;
    return { token, email };
  }
</script>

<script>
  import { goto, stores } from "@sapper/app";
  import { put } from "../../api";
  import SubmitButton from "../../components/SubmitButton.svelte";

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
        "Content-Type": "application/json",
      },
    })
      .then((r) => r.json())
      .then((r) => {
        $session.user = { jwt: r.token, id: r.userId, imageName: r.imageName };
        goto("/account");
      })
      .catch(() => alert("Incorrect email or password"));
  };
</script>

<style>
  .loginWrapper {
    max-width: 60rem;
    margin: 0 auto;
  }

  .loginWrapper:first-child {
    margin-top: 3rem;
  }

  .loginWrapper .loginContent {
    box-shadow: var(--boxShadow);
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    background-color: var(--background1);
  }

  :global(.loginWrapper .loginContent button) {
    width: 100%;
  }
  h1 {
    text-align: center;
    font-size: 2.5rem;
  }
</style>

<svelte:head>
  <title>Complete sign up - ReqWise</title>
</svelte:head>
<div class="contentWrapper loginWrapper">
  <h1>Complete sign up</h1>
  <form class="loginContent">
    <fieldset>
      <label for="email">Email</label>
      <input
        disabled
        autocomplete="email"
        bind:value={email}
        type="text"
        id="email" />
    </fieldset>
    <fieldset>
      <label for="name">Name</label>
      <input autocomplete="name" bind:value={name} type="text" id="name" />
    </fieldset>
    <fieldset>
      <label for="pwd">Password</label>
      <input
        autocomplete="password"
        bind:value={password}
        type="password"
        id="pwd" />
    </fieldset>
    <SubmitButton handler={submit}>Submit</SubmitButton>
  </form>
</div>
