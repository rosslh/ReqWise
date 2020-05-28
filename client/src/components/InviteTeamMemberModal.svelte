<script>
  import { stores } from "@sapper/app";
  const { session } = stores();
  export let update;
  export let close;
  export let id;
  import { post } from "../api.js";

  let inviteeEmail = "";
  let isAdmin = false;

  const inviteMember = async () => {
    await post(
      `/teams/${id}/invites`,
      { inviteeEmail, isAdmin },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };
</script>

<h3>Invite member</h3>
<form>
  <fieldset>
    <label for="inviteeEmail">Invitee email address</label>
    <input type="email" id="inviteeEmail" bind:value={inviteeEmail} />
  </fieldset>
  <fieldset>
    <input type="checkbox" id="isAdmin" bind:checked={isAdmin} />
    <label class="label-inline" for="isAdmin">Make administrator</label>
  </fieldset>
  <fieldset>
    <button class="button-create" on:click|preventDefault|once={inviteMember}>
      Invite
    </button>
  </fieldset>
</form>
