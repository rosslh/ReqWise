<script>
  import { jwt, userId } from "../stores.js";
  import { post } from "../api";

  let email = "";
  let password = "";

  const submit = () => {
    post("/auth/token", { email, password })
      .then(r => {
        jwt.set(r.token);
        userId.set(r.userId);
      })
      .catch(err => alert("Incorrect email or password"));
  };
</script>

<h2>Log in</h2>

<label for="email">Email</label>
<input bind:value={email} type="text" id="email" />
<br />
<label for="pwd">Password</label>
<input bind:value={password} type="password" id="pwd" />
<br />
<button on:click={submit}>Submit</button>
