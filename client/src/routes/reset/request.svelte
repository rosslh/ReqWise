<script>
  import { post } from "../../api";

  let email = "";

  const submit = () => {
    post(`/users/${encodeURIComponent(email)}/resets`, {})
      .then(r =>
        alert(
          "To finish resetting your password, please follow the link emailed to you."
        )
      )
      .catch(err => alert(JSON.stringify(err)));
  };
</script>

<div class="contentWrapper">
  <h2>Request password reset</h2>
  <form>
    <fieldset>
      <label for="email">Email</label>
      <input autocomplete="email" bind:value={email} type="email" id="email" />
    </fieldset>
    <button on:click|preventDefault={submit}>Send Reset Request</button>
  </form>
</div>
