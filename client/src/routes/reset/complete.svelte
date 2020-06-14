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
      <SubmitButton handler={submit}>Submit</SubmitButton>
    </fieldset>
  </form>
</div>
