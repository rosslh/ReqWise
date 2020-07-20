<script>
  import { stores } from "@sapper/app";
  import { modalContent, modalProps } from "../../../../stores.js";
  import NewQuestionnaireModal from "../../../../components/NewQuestionnaireModal.svelte";
  import QuestionnairePreview from "../../../../components/QuestionnairePreview.svelte";
  import { get } from "../../../../api.js";

  const { page, session } = stores();

  $: newQuestionnaire = () => {
    modalContent.set(NewQuestionnaireModal);
    modalProps.set({ projectId: $page.params.id });
  };

  const questionnaires = get(
    `/projects/${$page.params.id}/questionnaires?draft=false`,
    $session.user && $session.user.jwt
  );
</script>

<style>
  ul {
    list-style-type: none;
  }
</style>

<section class="contentWrapper">
  <h2>Brainstorm</h2>
  <p class="infoBlurb">...</p>
  <button on:click={newQuestionnaire} class="button button-success">
    Create questionnaire
  </button>
  <a
    href={`/project/${$page.params.id}/brainstorm/drafts`}
    class="button button-outline button-secondary">
    View drafts
  </a>
</section>
<section class="contentWrapper">
  {#await questionnaires}
    <!-- Loading -->
  {:then result}
    <ul>
      {#each result as questionnaire (questionnaire.id)}
        <QuestionnairePreview {questionnaire} projectId={$page.params.id} />
      {/each}
      {#if !result.length}No published questionnaires{/if}
    </ul>
  {/await}
</section>
