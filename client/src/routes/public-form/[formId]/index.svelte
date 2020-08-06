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
  import { get } from "../../../api.js";
  import { stores } from "@sapper/app";
  import BrainstormPrompt from "../../../components/BrainstormPrompt.svelte";

  export let questionnaire;

  const { page, session } = stores();

  // const update = async () => {
  //   questionnaire = await get(
  //     `/questionnaires/${$page.params.formId}`,
  //     $session.user && $session.user.jwt
  //   );
  // };

  let prompts = questionnaire.prompts;

  $: updatePrompts = async () => {
    ({ prompts } = await get(
      `/questionnaires/${$page.params.formId}`,
      $session.user && $session.user.jwt
    ));
  };
</script>

<svelte:head>
  <title>{questionnaire.description} - ReqWise</title>
</svelte:head>
<section class="contentWrapper">
  <h1>{questionnaire.description}</h1>
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
