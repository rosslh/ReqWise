<script context="module">
  import { setLoginParam } from "../../utils.js";
  export async function preload(page, { user }) {
    setLoginParam(page, user, this.redirect);
  }
</script>

<script>
  import { post } from "../../api";
  import SubmitButton from "../../components/SubmitButton.svelte";

  let email = "";

  const submit = async () => {
    try {
      await post(`/users/${encodeURIComponent(email)}/resets`, {});
      alert(
        "To finish resetting your password, please follow the link emailed to you."
      );
    } catch {
      alert("Error. Please try again later.");
    }
  };
</script>

<svelte:head>
  <title>Reset password - ReqWise</title>
</svelte:head>
<div class="contentWrapper">
  <h2>Request password reset</h2>
  <form>
    <fieldset>
      <label for="email">Email</label>
      <input autocomplete="email" bind:value={email} type="email" id="email" />
    </fieldset>
    <SubmitButton handler={submit}>Send Reset Request</SubmitButton>
  </form>
</div>
