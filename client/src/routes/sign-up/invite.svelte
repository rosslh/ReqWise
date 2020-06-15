<script>
  import { post } from "../../api";
  import SubmitButton from "../../components/SubmitButton.svelte";

  let email = "";

  const submit = async () => {
    try {
      await post(`/users`, { email });
      alert("Please check your email to finish signing up");
    } catch {
      alert("Error. Please try again later.");
    }
  };
</script>

<svelte:head>
  <title>Sign up - ReqWise</title>
</svelte:head>
<div class="contentWrapper">
  <h1>Sign up</h1>
  <form>
    <fieldset>
      <label for="email">Email</label>
      <input autocomplete="email" bind:value={email} type="email" id="email" />
      <SubmitButton handler={submit}>Send Invite</SubmitButton>
    </fieldset>
  </form>
</div>
