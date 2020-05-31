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
  <h2>Sign up</h2>
  <form>
    <fieldset>
      <label for="email">Email</label>
      <input autocomplete="email" bind:value={email} type="email" id="email" />
      <SubmitButton handler={submit}>Send Invite</SubmitButton>
    </fieldset>
  </form>
</div>
