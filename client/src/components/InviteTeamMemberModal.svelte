<script>
  export let update;
  export let close;
  export let id;
  import { post } from "../api.js";

  let inviteeEmail = "";
  let isAdmin = false;

  const inviteMember = async () => {
    await post(`/teams/${id}/invites`, { inviteeEmail, isAdmin });
    await update();
    close();
  };
</script>

<fieldset>
  <label for="inviteeEmail">Invitee email address</label>
  <input type="email" id="inviteeEmail" bind:value={inviteeEmail} />
</fieldset>
<fieldset>
  <input type="checkbox" id="isAdmin" bind:checked={isAdmin} />
  <label class="label-inline" for="isAdmin">Make administrator</label>
</fieldset>
<fieldset>
  <button class="button-create" on:click={inviteMember}>Invite</button>
</fieldset>
