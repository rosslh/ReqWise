<script>
  export let update;
  export let close;
  import { post } from "../api.js";

  let teamName = "";
  let teamDesc = "";

  const submitNewTeam = async () => {
    await post(`/teams`, { name: teamName, description: teamDesc });
    await update();
    close();
  };
</script>

<h3>Create team</h3>
<fieldset>
  <label for="teamName">Team name</label>
  <input type="text" bind:value={teamName} />
</fieldset>
<fieldset>
  <label for="teamDesc">Description</label>
  <textarea bind:value={teamDesc} />
</fieldset>
<fieldset>
  <button class="button-create" on:click={submitNewTeam}>Create</button>
</fieldset>
