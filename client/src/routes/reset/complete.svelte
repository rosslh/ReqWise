<script context="module">
  export async function preload(page) {
    const { token, email } = page.query;

    return { token, email };
  }
</script>

<script>
  import { goto } from "@sapper/app";
  import { put } from "../../api";
  import SubmitButton from "../../components/SubmitButton.svelte";

  export let token;
  export let email;

  let password = "";

  const submit = async () => {
    await put(`/users/${encodeURIComponent(email)}/password`, {
      password,
      token,
    });
    goto("/login");
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
  <title>Complete password reset - ReqWise</title>
</svelte:head>
<div class="contentWrapper loginWrapper">
  <h1>Complete password reset</h1>
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
      <label for="password">New password</label>
      <input
        autocomplete="password"
        bind:value={password}
        type="password"
        id="password" />
    </fieldset>
    <SubmitButton handler={submit}>Submit</SubmitButton>
  </form>
</div>
