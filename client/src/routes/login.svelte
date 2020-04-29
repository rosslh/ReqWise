<script>
  import { goto, stores } from "@sapper/app";
  const { session } = stores();
  import { post } from "../api";

  let email = "";
  let password = "";

  const submit = () => {
    post("/auth/token", { email, password })
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
