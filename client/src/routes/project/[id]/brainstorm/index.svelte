<script>
  import { stores } from "@sapper/app";
  import { modalContent, modalProps } from "../../../../stores.js";
  import NewQuestionnaireModal from "../../../../components/NewQuestionnaireModal.svelte";
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

<section class="contentWrapper">
  <h2>Brainstorm</h2>
  <p class="infoBlurb">...</p>
  <button on:click={newQuestionnaire} class="button button-success">
    Create questionnaire
  </button>
  <a
    href={`/project/${$page.params.id}/brainstorm/forms`}
    class="button button-outline button-secondary">
    View drafts
  </a>
</section>
<section class="contentWrapper">
  {#await questionnaires}
    Loading
  {:then result}
    <ul>
      {#each result as q}
        <li>
          <a href={`/project/${$page.params.id}/brainstorm/forms/${q.id}`}>
            {q.description}
          </a>
        </li>
      {/each}
    </ul>
  {/await}
</section>
