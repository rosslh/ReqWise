<script>
  import { stores } from "@sapper/app";
  import { format } from "date-fns";
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

  const existingInvites = get(
    `/questionnaires/${$page.params.formId}/invites`,
    $session.user && $session.user.jwt
  );

  let selectedStakeholder;

  let addNewStakeholder = false;
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }

  .panel h4 {
    margin-top: 0.75rem;
  }
</style>

<h3>Share with Stakeholder</h3>
{#if addNewStakeholder}
  <div class="panel">
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
        <SubmitButton
          id="saveQuestionnaireDropdown"
          handler={inviteUserFromDropdown}>
          Send email invite
        </SubmitButton>
      </fieldset>
    </form>
  </div>
  <div class="panel">
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
  </div>
{:else}
  <h4>Recent invitations</h4>
  {#await existingInvites}
    <!-- loading -->
  {:then result}
    {#if !result.length}<span class="secondary">No invites yet</span>{/if}
    <table class="compact">
      <thead>
        <tr>
          <th>Shared with</th>
          <th>Email sent at</th>
        </tr>
      </thead>
      <tbody>
        {#each result as { inviteeEmail, created_at }}
          <td>{inviteeEmail}</td>
          <td>
            <time datetime={created_at} class="date">
              {format(new Date(created_at), 'h:mm a, MMMM d, yyyy')}
            </time>
          </td>
        {/each}
      </tbody>
    </table>
  {/await}
{/if}
<button
  data-cy="toggleShowForm"
  class="button button-outline button-secondary"
  on:click={() => {
    addNewStakeholder = !addNewStakeholder;
  }}>
  {#if addNewStakeholder}View invites{:else}Invite a stakeholder{/if}
</button>
