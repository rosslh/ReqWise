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
        "Content-Type": "application/json",
      },
    });

    const data = await r.json();

    $session.user = {
      jwt: data.token,
      id: data.userId,
      theme: data.theme,
      imageName: data.imageName,
    };

    if ($page.query.redirect) {
      goto($page.query.redirect);
    } else {
      goto("/account");
    }
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

  .loginWrapper .createAccountContent {
    text-align: center;
  }

  .loginWrapper .loginContent,
  .loginWrapper .createAccountContent {
    box-shadow: var(--boxShadow);
    border-radius: 0.5rem;
    padding: 1.75rem;
    margin-bottom: 1.75rem;
    background-color: var(--background1);
  }

  :global(.loginWrapper .loginContent button) {
    width: 100%;
  }

  div.pwdLabelWrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  div.pwdLabelWrapper a {
    margin-left: 2rem;
    margin-bottom: 0.5rem;
  }

  h1 {
    text-align: center;
    font-size: 2.5rem;
  }
</style>

<svelte:head>
  <title>Login - ReqWise</title>
</svelte:head>
<div class="contentWrapper loginWrapper">
  <h1>Sign in to ReqWise</h1>
  <form class="loginContent">
    <fieldset>
      <label for="email">Email</label>
      <input autocomplete="email" bind:value={email} type="text" id="email" />
    </fieldset>
    <fieldset>
      <div class="pwdLabelWrapper">
        <label for="pwd">Password</label>
        <a rel="prefetch" href="/reset/request">Forgot password?</a>
      </div>
      <input
        autocomplete="password"
        bind:value={password}
        type="password"
        id="pwd" />
    </fieldset>
    <SubmitButton handler={submit}>Sign in</SubmitButton>
  </form>
</div>
<div class="contentWrapper loginWrapper">
  <div class="createAccountContent">
    New to ReqWise? <a rel="prefetch" href="/sign-up/invite">Create an account.</a>
  </div>
</div>
