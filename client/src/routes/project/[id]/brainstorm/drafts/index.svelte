<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../api.js";
  import QuestionnairePreview from "../../../../../components/QuestionnairePreview.svelte";

  const { page, session } = stores();

  const questionnaires = get(
    `/projects/${$page.params.id}/questionnaires?draft=true`,
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
      {#if !result.length}No drafts{/if}
    </ul>
  {/await}
</section>
