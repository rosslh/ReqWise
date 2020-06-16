<script>
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let update;
  export let close;
  import { post } from "../api.js";

  import SubmitButton from "../components/SubmitButton.svelte";

  let teamName = "";
  let teamDesc = "";

  const submitNewTeam = async () => {
    await post(
      `/teams`,
      { name: teamName, description: teamDesc },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };
</script>

<h3>Create team</h3>
<form>
  <fieldset>
    <label for="teamName">Team name</label>
    <input type="text" id="teamName" bind:value={teamName} />
  </fieldset>
  <fieldset>
    <label for="teamDesc">Description</label>
    <textarea id="teamDesc" bind:value={teamDesc} />
  </fieldset>
  <fieldset>
    <SubmitButton handler={submitNewTeam}>Create</SubmitButton>
  </fieldset>
</form>
