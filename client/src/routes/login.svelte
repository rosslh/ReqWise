<script>
  import { jwt, userId } from "../stores.js";
  import { post } from "../api";

  let email = "";
  let password = "";

  const submit = e => {
    e.preventDefault();
    post("/auth/token", { email, password })
      .then(r => {
        jwt.set(r.token);
        userId.set(r.userId);
      })
      .catch(err => alert("Incorrect email or password"));
  };
</script>

<h2>Log in</h2>
<form>
  <fieldset>
    <label for="email">Email</label>
    <input bind:value={email} type="text" id="email" />
    <label for="pwd">Password</label>
    <input bind:value={password} type="password" id="pwd" />
    <button class="btn btn-primary" on:click={submit}>Submit</button>
  </fieldset>
</form>
