<script context="module">
  export async function preload(page, session) {
    const questionnaire = await get(
      `/questionnaires/${page.params.formId}`,
      session.user && session.user.jwt
    );
    return { questionnaire };
  }
</script>

<script>
  import { get } from "../../../../../../api.js";
  import { stores } from "@sapper/app";
  import { modalContent, modalProps } from "../../../../../../stores.js";
  import AddBrainstormPromptModal from "../../../../../../components/AddBrainstormPromptModal.svelte";
  import EditQuestionnaireModal from "../../../../../../components/EditQuestionnaireModal.svelte";
  import ShareQuestionnaireModal from "../../../../../../components/ShareQuestionnaireModal.svelte";
  import BrainstormPrompt from "../../../../../../components/BrainstormPrompt.svelte";
  import Ribbon from "../../../../../../components/Ribbon.svelte";

  export let questionnaire;

  const { page, session } = stores();

  const update = async () => {
    questionnaire = await get(
      `/questionnaires/${$page.params.formId}`,
      $session.user && $session.user.jwt
    );
  };

  let prompts = questionnaire.prompts;

  $: updatePrompts = async () => {
    ({ prompts } = await get(
      `/questionnaires/${$page.params.formId}`,
      $session.user && $session.user.jwt
    ));
  };

  $: addPrompt = () => {
    modalContent.set(AddBrainstormPromptModal);
    modalProps.set({ update: updatePrompts, id: $page.params.formId });
  };

  $: showSettingsModal = () => {
    modalContent.set(EditQuestionnaireModal);
    modalProps.set({ questionnaire, update });
  };

  $: shareQuestionnaire = () => {
    modalContent.set(ShareQuestionnaireModal);
    modalProps.set({ questionnaire, update });
  };
</script>

<style>
  .formHeader {
    display: flex;
    align-items: center;
    padding-top: 0.5rem;
  }
  .formHeader h2 {
    margin-top: 1.5rem;
    margin-left: 1rem;
    margin-right: 6rem;
  }
</style>

<div class="contentWrapper">
  <div class="backLink">
    <a rel="prefetch" href={`/project/${questionnaire.project_id}/brainstorm`}>
      &larr;&nbsp;View all questionnaires
    </a>
  </div>
</div>
<section class="contentWrapper">
  <div class="formHeader">
    <h2>{questionnaire.description}</h2>
    {#if questionnaire.is_draft}
      <Ribbon
        label="Draft"
        bgColor="var(--secondaryText)"
        backdropColor="var(--backdrop)"
        width="3.75rem" />
    {/if}
  </div>
  {#if questionnaire.is_draft}
    <button
      data-cy="addPrompt"
      on:click={addPrompt}
      class="button button-success">
      Add prompt
    </button>
  {/if}
  <button
    data-cy="questionnaireSettings"
    on:click={showSettingsModal}
    class="button button-secondary button-outline">
    Settings
  </button>
  {#if !questionnaire.is_draft}
    <button
      data-cy="shareQuestionnaire"
      on:click={shareQuestionnaire}
      class="button button-secondary button-outline">
      Share
    </button>
  {/if}
  {#if questionnaire.is_public}
    <a
      data-cy="viewPublic"
      rel="prefetch"
      href={`/public-form/${$page.params.formId}`}
      class="button button-secondary button-outline">
      View public questionnaire
    </a>
  {/if}
</section>
<section class="contentWrapper">
  {#each prompts as prompt (prompt.id)}
    <BrainstormPrompt
      {prompt}
      update={updatePrompts}
      isDraft={questionnaire.is_draft}
      isOpen={questionnaire.is_open} />
  {/each}
</section>
