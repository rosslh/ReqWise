<script context="module">
  export async function preload(page, session) {
    const questionnaire = await get(
      `/questionnaires/${page.params.draftId}`,
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

  export let questionnaire;

  let prompts = questionnaire.prompts;

  const { page } = stores();

  $: updatePrompts = async () => {
    ({ prompts } = await get(
      `/questionnaires/${$page.params.draftId}`,
      session.user && session.user.jwt
    ));
  };

  $: addPrompt = () => {
    modalContent.set(AddBrainstormPromptModal);
    modalProps.set({ update: updatePrompts, id: $page.params.draftId });
  };
</script>

<section class="contentWrapper">
  <h2>
    Draft questionnaire:
    <em>{questionnaire.description}</em>
  </h2>
  <button on:click={addPrompt} class="button button-success">Add prompt</button>
  <button class="button button-secondary button-outline">Settings</button>
  <button class="button button-secondary button-outline">Publish</button>
</section>
<section class="contentWrapper">
  {#each prompts as prompt (prompt.id)}{JSON.stringify(prompt)}{/each}
</section>
