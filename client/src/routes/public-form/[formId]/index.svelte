<script context="module">
  export async function preload(page, session) {
    if (session && session.user) {
      try {
        const questionnaire = await get(
          `/questionnaires/${page.params.formId}`,
          session.user && session.user.jwt
        );
        return { questionnaire }; // Logged in and access granted
      } catch (e) {
        return this.redirect(302, `/account`); // Logged in but no access
      }
    } else {
      try {
        const questionnaire = await get(
          `/questionnaires/${page.params.formId}`
        );
        return { questionnaire }; // anonymous and form is public
      } catch (e) {
        return this.redirect(302, `/account`); // anonymous and private form
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
  {#if questionnaire.is_public}
    <p class="panel">
      Shareable link: <a class="shareLink" target="_blank" rel="noopener" href={`https://reqwise.com${$page.path}`}><code>{`https://reqwise.com${$page.path}`}</code></a>
    </p>
  {/if}
  {#each prompts as prompt (prompt.id)}
    <BrainstormPrompt
      {prompt}
      update={updatePrompts}
      isDraft={questionnaire.is_draft}
      isOpen={questionnaire.is_open} />
  {/each}
</section>
