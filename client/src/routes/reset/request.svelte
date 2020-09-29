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
      throw new Error("Error signing up");
    }
  };
</script>

<style>
  .loginWrapper {
    max-width: 60rem;
    margin: 0 auto;
  }

  .loginWrapper:first-child {
    margin-top: 3rem;
  }

  .loginWrapper .loginContent {
    box-shadow: var(--boxShadow);
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    background-color: var(--background1);
  }

  :global(.loginWrapper .loginContent button) {
    width: 100%;
  }

  h1 {
    text-align: center;
    font-size: 2.5rem;
  }
</style>

<svelte:head>
  <title>Reset password - ReqWise</title>
</svelte:head>
<div class="contentWrapper loginWrapper">
  <h1>Reset password</h1>
  <form class="loginContent">
    <fieldset>
      <label for="email">Email</label>
      <input autocomplete="email" bind:value={email} type="text" id="email" />
    </fieldset>
    <SubmitButton handler={submit}>Submit</SubmitButton>
  </form>
</div>
