<script>
  import { stores } from "@sapper/app";
  import { getContext } from "svelte";
  import { modalContent, modalProps } from "../../../../stores.js";
  import NewQuestionnaireModal from "../../../../components/NewQuestionnaireModal.svelte";
  import QuestionnairePreview from "../../../../components/QuestionnairePreview.svelte";
  import { get } from "../../../../api.js";

  const { page, session } = stores();

  const newQuestionnaire = () => {
    modalContent.set(NewQuestionnaireModal);
    modalProps.set({ projectId: $page.params.id });
  };

  const questionnaires = get(
    `/projects/${$page.params.id}/questionnaires?draft=false`,
    $session.user && $session.user.jwt
  );

  const scopes = getContext(`scopes`);
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
    <button
      data-cy="newQuestionnaire"
      on:click={newQuestionnaire}
      class="button button-success">
      Create questionnaire
    </button>
    <a
      href={`/project/${$page.params.id}/brainstorm/drafts`}
      class="button button-outline button-secondary">
      View drafts
    </a>
  {/if}
</section>
<section class="contentWrapper">
  {#await questionnaires}
    <!-- Loading -->
  {:then result}
    {#if result.length}
      <ul>
        {#each result as questionnaire (questionnaire.id)}
          <QuestionnairePreview {questionnaire} projectId={$page.params.id} />
        {/each}
        {#if !result.length}No published questionnaires{/if}
      </ul>
    {:else}
      <div class="secondary">No published questionnaires</div>
    {/if}
  {/await}
</section>
