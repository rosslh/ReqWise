<script context="module">
  export async function preload(page) {
    const questionnaire = await get(`/questionnaires/${page.params.formId}`);
    return { questionnaire };
  }
</script>

<script>
  import { get } from "../../../api.js";
  import { stores } from "@sapper/app";
  import BrainstormPrompt from "../../../components/BrainstormPrompt.svelte";

  export let questionnaire;

  const { page } = stores();

  const update = async () => {
    questionnaire = await get(`/questionnaires/${$page.params.formId}`);
  };

  let prompts = questionnaire.prompts;

  $: updatePrompts = async () => {
    ({ prompts } = await get(`/questionnaires/${$page.params.formId}`));
  };
</script>

<section class="contentWrapper">
  <h2>{questionnaire.description}</h2>
</section>
<section class="contentWrapper">
  {#each prompts as prompt (prompt.id)}
    <BrainstormPrompt
      {prompt}
      update={updatePrompts}
      isDraft={false}
      isOpen={questionnaire.is_open} />
  {/each}
</section>
