<script>
  import { stores } from "@sapper/app";
  const { session, page } = stores();
  import Select from "svelte-select";

  export let close;
  export let questionnaire;
  export let update;

  import { post, get } from "../api.js";

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

  const inviteUserFromDropdown = async () => {
    await post(
      `/questionnaires/${questionnaire.id}/invites`,
      { inviteeEmail: selectedStakeholder.value },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };

  const stakeholders = get(
    `/projects/${$page.params.id}/external-stakeholders`,
    $session.user && $session.user.jwt
  );

  let selectedStakeholder;
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<h3>Share with Stakeholder</h3>
<h4>Existing stakeholder</h4>
<form>
  <fieldset>
    {#await stakeholders}
      <!-- Loading -->
    {:then result}
      <Select
        inputAttributes={{ id: 'type' }}
        isClearable={false}
        items={result.map((s) => ({
          label: `${s.name} &lt;${s.email}&gt;`,
          value: s.email,
        }))}
        bind:selectedValue={selectedStakeholder} />
    {/await}
  </fieldset>
  <fieldset>
    <SubmitButton id="saveQuestionnaire" handler={inviteUserFromDropdown}>
      Send email invite
    </SubmitButton>
  </fieldset>
</form>
<h4>New stakeholder</h4>
<p class="secondary">
  User will receive an invitation to become a project stakeholder.
</p>
<form>
  <fieldset>
    <label for="inviteeEmail">Email</label>
    <input type="email" id="inviteeEmail" bind:value={inviteeEmail} />
  </fieldset>
  <fieldset>
    <SubmitButton id="saveQuestionnaire" handler={inviteUser}>
      Send email invite
    </SubmitButton>
  </fieldset>
</form>
