<script>
  import { goto, stores } from "@sapper/app";
  const { session } = stores();

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
        $session.user = { jwt: r.token, id: r.userId };
        goto("/teams");
      })
      .catch(err => alert("Incorrect email or password"));
  };
</script>

<style>
  .forgotPwd {
    margin-top: 2rem;
  }
</style>

<div class="contentWrapper">
  <h2>Log in</h2>
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
  <button on:click={submit}>Submit</button>
</div>
<div class="contentWrapper forgotPwd">
  <a href="/reset/request">Forgot password?</a>
</div>
