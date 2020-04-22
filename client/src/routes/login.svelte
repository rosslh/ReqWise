<script>
  import { goto } from "@sapper/app";
  import { jwt, userId } from "../stores.js";
  import { post } from "../api";

  let email = "";
  let password = "";

  const submit = () => {
    post("/auth/token", { email, password })
      .then(r => {
        jwt.set(r.token);
        userId.set(r.userId);
        goto("/teams");
      })
      .catch(err => alert("Incorrect email or password"));
  };
</script>

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
