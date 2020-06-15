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
  <h1>Request password reset</h1>
  <form>
    <fieldset>
      <label for="email">Email</label>
      <input autocomplete="email" bind:value={email} type="email" id="email" />
    </fieldset>
    <SubmitButton handler={submit}>Send Reset Request</SubmitButton>
  </form>
</div>
