<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../api.js";
  import QuestionnairePreview from "../../../../components/QuestionnairePreview.svelte";
  import NewQuestionnaireModal from "../../../../components/NewQuestionnaireModal.svelte";
  import { getContext } from "svelte";
  const scopes = getContext(`scopes`);
  import { modalContent, modalProps } from "../../../../stores.js";

  const { page, session } = stores();

  const newQuestionnaire = () => {
    modalContent.set(NewQuestionnaireModal);
    modalProps.set({ projectId: $page.params.id });
  };

  const questionnaires = get(
    `/projects/${$page.params.id}/questionnaires?draft=true`,
    $session.user && $session.user.jwt
  );
</script>

<style>
  ul {
    list-style-type: none;
  }

  .secondary {
    color: var(--secondaryText);
    display: flex;
    justify-content: center;
    margin: 2rem 0;
  }
</style>

<section class="contentWrapper">
  <h2>Brainstorm</h2>
  <p class="infoBlurb">
    Questionnaires let you aggregate and follow through on feedback from
    customers and team members. Individual questionnaire prompts can be linked
    to requirements.
  </p>
  {#if scopes.includes('member')}
    <button on:click={newQuestionnaire} class="button button-success">
      Create questionnaire
    </button>
  {/if}
  <a
    href={`/project/${$page.params.id}/brainstorm`}
    class="button button-outline button-secondary">
    View published
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
      {#if !result.length}
        <div class="secondary">No draft questionnaires</div>
      {/if}
    </ul>
  {/await}
</section>
