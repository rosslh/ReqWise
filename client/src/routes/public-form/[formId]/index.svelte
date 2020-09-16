<script context="module">
  export async function preload(page, session) {
    if (session && session.user) {
      const questionnaire = await get(
        `/questionnaires/${page.params.formId}`,
        session.user && session.user.jwt
      );
      if (!questionnaire.is_public) {
        return this.redirect(
          302,
          `/project/${questionnaire.project_id}/brainstorm/forms/${page.params.formId}`
        );
      }
      return { questionnaire };
    } else {
      try {
        const questionnaire = await get(
          `/questionnaires/${page.params.formId}`
        );
        return { questionnaire };
      } catch (e) {
        return this.redirect(302, `/account`);
      }
    }
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

<style>
  .shareLink {
    color: var(--normalText);
  }
</style>

<svelte:head>
  <title>{questionnaire.description} - ReqWise</title>
</svelte:head>
<section class="contentWrapper">
  <h1>{questionnaire.description}</h1>
  <p class="panel">
    Shareable link: <a class="shareLink" target="_blank" rel="noopener" href={`https://reqwise.com${$page.path}`}><code>{`https://reqwise.com${$page.path}`}</code></a>
  </p>
  {#each prompts as prompt (prompt.id)}
    <BrainstormPrompt
      {prompt}
      update={updatePrompts}
      isDraft={questionnaire.is_draft}
      isOpen={questionnaire.is_open} />
  {/each}
</section>
