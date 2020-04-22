<script>
  import { post } from "../../api";

  let email = "";

  const submit = () => {
    post(`/users`, { email })
      .then(r => alert(JSON.stringify(r)))
      .catch(err => alert(JSON.stringify(err)));
  };
</script>

<div class="contentWrapper">
  <h2>Sign up</h2>
  <label for="email">Email</label>
  <input autocomplete="email" bind:value={email} type="email" id="email" />
  <button on:click={submit}>Send Invite</button>
</div>
