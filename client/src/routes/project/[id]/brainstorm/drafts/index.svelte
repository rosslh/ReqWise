<script>
  import { stores } from "@sapper/app";
  import { modalContent, modalProps } from "../../../../../stores.js";
  import NewQuestionnaireModal from "../../../../../components/NewQuestionnaireModal.svelte";
  import { get } from "../../../../../api.js";

  const { page, session } = stores();

  const newQuestionnaire = () => {
    modalContent.set(NewQuestionnaireModal);
    modalProps.set({});
  };

  const questionnaires = get(
    `/projects/${$page.params.id}/questionnaires?draft=true`,
    $session.user && $session.user.jwt
  );
</script>

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
    Loading
  {:then result}
    <ul>
      {#each result as q}
        <li>
          <a href={`/project/${$page.params.id}/brainstorm/drafts/${q.id}`}>
            {q.description}
          </a>
        </li>
      {/each}
    </ul>
  {/await}
</section>
