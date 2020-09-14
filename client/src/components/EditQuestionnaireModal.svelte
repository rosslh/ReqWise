<script>
  import { stores } from "@sapper/app";
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
      {
        description,
        is_draft: isDraft,
        is_public: isPublic,
        is_open: !isClosed,
      },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };

  let isDraft = questionnaire.is_draft;
  let isPublic = questionnaire.is_public;
  let isClosed = !questionnaire.is_open;
</script>

<style>
  .draftInput label,
  .closedInput label,
  .publicInput label {
    font-weight: 500 !important;
  }
  .draftInput {
    color: var(--secondaryText);
  }

  .publicInput {
    color: var(--orange);
  }

  .closedInput {
    color: var(--red);
  }
</style>

<h3>Questionnaire settings</h3>
<form>
  <fieldset>
    <label for="description">Description</label>
    <input type="text" id="description" bind:value={description} />
  </fieldset>
  <fieldset class="draftInput">
    <input type="checkbox" id="isDraft" bind:checked={isDraft} />
    <label class="label-inline" for="isDraft">Questionnaire is a draft</label>
  </fieldset>
  <fieldset class="publicInput">
    <input type="checkbox" id="isPublic" bind:checked={isPublic} />
    <label class="label-inline" for="isPublic">
      Questionnaire is publically viewable outside of your team
    </label>
  </fieldset>
  <fieldset class="closedInput">
    <input type="checkbox" id="isClosed" bind:checked={isClosed} />
    <label class="label-inline" for="isClosed"> Questionnaire is closed </label>
  </fieldset>
  <fieldset>
    <SubmitButton handler={updateQuestionnaire}>Save</SubmitButton>
  </fieldset>
</form>
