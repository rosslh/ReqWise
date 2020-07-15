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
  import BrainstormPrompt from "../../../../../../components/BrainstormPrompt.svelte";

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
</script>

<section class="contentWrapper">
  <h2>
    {#if questionnaire.is_draft}[Draft]{/if}
    {questionnaire.description}
  </h2>
  {#if questionnaire.is_draft}
    <button on:click={addPrompt} class="button button-success">
      Add prompt
    </button>
  {/if}
  <button
    on:click={showSettingsModal}
    class="button button-secondary button-outline">
    Settings
  </button>
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
