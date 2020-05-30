<script>
  import { goto, stores } from "@sapper/app";
  const { session, page } = stores();

  let email = "";
  let password = "";

  const submit = () => {
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
        $session.user = {
          jwt: r.token,
          id: r.userId,
          theme: r.theme
        };
        if ($page.query.redirect) {
          goto($page.query.redirect);
        } else {
          goto("/teams");
        }
      })
      .catch(err => alert("Incorrect email or password"));
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
  <h2>Log in</h2>
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
    <button on:click|preventDefault={submit}>Submit</button>
  </form>
</div>
<div class="contentWrapper forgotPwd">
  <a href="/reset/request">Forgot password?</a>
</div>
