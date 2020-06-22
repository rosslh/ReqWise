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

<style>
  .signupWrapper {
    max-width: 50rem;
    margin: 0 auto;
  }

  .signupWrapper:first-child {
    margin-top: 3rem;
  }

  .signupWrapper .signinContent {
    text-align: center;
  }

  .signupWrapper .signupContent,
  .signupWrapper .signinContent {
    border: 0.1rem solid var(--borderColor);
    border-radius: 0.4rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    background-color: var(--background1);
  }

  :global(.signupWrapper .signupContent button) {
    width: 100%;
  }

  h1 {
    text-align: center;
    font-size: 2.5rem;
  }
</style>

<svelte:head>
  <title>Sign up - ReqWise</title>
</svelte:head>
<div class="contentWrapper signupWrapper">
  <h1>Sign up for ReqWise</h1>
  <form class="signupContent">
    <fieldset>
      <label for="email">Email</label>
      <input autocomplete="email" bind:value={email} type="text" id="email" />
    </fieldset>
    <SubmitButton handler={submit}>Send invite</SubmitButton>
  </form>
</div>
<div class="contentWrapper signupWrapper">
  <div class="signinContent">
    Already have an account?
    <a href="/login">Sign in.</a>
  </div>
</div>
