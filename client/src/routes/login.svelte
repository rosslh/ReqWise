<script>
  import { goto, stores } from "@sapper/app";
  const { session, page } = stores();

  import SubmitButton from "../components/SubmitButton.svelte";

  let email = "";
  let password = "";

  const submit = async () => {
    const r = await fetch("auth/login", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await r.json();

    $session.user = {
      jwt: data.token,
      id: data.userId,
      theme: data.theme
    };

    if ($page.query.redirect) {
      goto($page.query.redirect);
    } else {
      goto("/teams");
    }
  };
</script>

<style>
  .forgotPwd {
    margin-top: 2rem;
  }
</style>

<svelte:head>
  <title>Login - ReqWise</title>
</svelte:head>
<div class="contentWrapper panel">
  <h1>Log in</h1>
  <form>
    <fieldset>
      <label for="email">Email</label>
      <input autocomplete="email" bind:value={email} type="text" id="email" />
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
<div class="contentWrapper forgotPwd">
  <a href="/reset/request">Forgot password?</a>
</div>
