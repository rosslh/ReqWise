<script>
  import { post } from "../../api";

  let email = "";

  const submit = () => {
    post(`/users`, { email })
      .then(() => alert("Please check your email to finish signing up"))
      .catch(err => alert(JSON.stringify(err)));
  };
</script>

<svelte:head>
  <title>Sign up - ReqWise</title>
</svelte:head>
<div class="contentWrapper">
  <h2>Sign up</h2>
  <form>
    <fieldset>
      <label for="email">Email</label>
      <input autocomplete="email" bind:value={email} type="email" id="email" />
      <button on:click|preventDefault={submit}>Send Invite</button>
    </fieldset>
  </form>
</div>
