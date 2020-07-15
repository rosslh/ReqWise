<script>
  import { stores, goto } from "@sapper/app";
  const { session } = stores();

  export let close;
  export let questionnaire;
  export let update;

  import { put } from "../api.js";

  import SubmitButton from "../components/SubmitButton.svelte";

  let description = questionnaire.description;

  const updateQuestionnaire = async () => {
    await put(
      `/questionnaires/${questionnaire.id}`,
      { description, is_draft: isDraft, is_public: isPublic, is_open: isOpen },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };

  let isDraft = questionnaire.is_draft;
  let isPublic = questionnaire.is_public;
  let isOpen = questionnaire.is_open;
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<h3>Questionnaire settings</h3>
<form>
  <fieldset>
    <label for="description">Description</label>
    <input type="text" id="description" bind:value={description} />
  </fieldset>
  <fieldset>
    <input type="checkbox" id="isDraft" bind:checked={isDraft} />
    <label class="label-inline" for="isDraft">Questionnaire is a draft</label>
  </fieldset>
  <fieldset>
    <input type="checkbox" id="isPublic" bind:checked={isPublic} />
    <label class="label-inline" for="isPublic">
      Questionnaire is publically viewable outside of your team
    </label>
  </fieldset>
  <fieldset>
    <input type="checkbox" id="isOpen" bind:checked={isOpen} />
    <label class="label-inline" for="isOpen">
      Questionnaire is open to responses
      <span class="secondary">
        {#if isDraft}(once published){/if}
      </span>
    </label>
  </fieldset>
  <fieldset>
    <SubmitButton handler={updateQuestionnaire}>Save</SubmitButton>
  </fieldset>
</form>
