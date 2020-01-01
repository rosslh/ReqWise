<script>
  import { post } from "../api";

  let name = "";
  let email = "";
  let password = "";

  const submit = () => {
    post("/auth/user", { name, email, password })
      .then(r => alert(JSON.stringify(r)))
      .catch(err => alert(JSON.stringify(err)));
  };
</script>

<h2>Sign up</h2>

<label for="email">Email</label>
<input bind:value={email} type="text" id="email" />
<label for="name">Name</label>
<input bind:value={name} type="text" id="name" />
<label for="pwd">Password</label>
<input bind:value={password} type="password" id="pwd" />
<button on:click={submit}>Submit</button>
