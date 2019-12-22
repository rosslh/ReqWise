<script>
  import { post } from "../api";

  let username = "";
  let email = "";
  let password = "";

  const submit = () => {
    post("/auth/user", { username, email, password })
      .then(r => alert(JSON.stringify(r)))
      .catch(err => alert(JSON.stringify(err)));
  };
</script>

<svelte:head>
  <title>Sapper project template</title>
</svelte:head>

<h2>Sign up</h2>

<label for="username">Username</label>
<input bind:value={username} type="text" id="username" />
<br />
<label for="email">Email</label>
<input bind:value={email} type="text" id="email" />
<br />
<label for="pwd">Password</label>
<input bind:value={password} type="password" id="pwd" />
<br />
<button on:click={submit}>Submit</button>
