<script>
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let close;
  export let questionnaire;
  export let update;

  import { post } from "../api.js";

  import SubmitButton from "../components/SubmitButton.svelte";

  let inviteeEmail = "";

  const inviteUser = async () => {
    await post(
      `/questionnaires/${questionnaire.id}/invites`,
      { inviteeEmail },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };
</script>

<h3>Share questionnaire</h3>
<p>
  They will receive a link to the questionnaire and an invitation to become a
  stakeholder.
</p>
<form>
  <fieldset>
    <label for="inviteeEmail">Email</label>
    <input type="email" id="inviteeEmail" bind:value={inviteeEmail} />
  </fieldset>
  <fieldset>
    <SubmitButton id="saveQuestionnaire" handler={inviteUser}>
      Send invite
    </SubmitButton>
  </fieldset>
</form>
