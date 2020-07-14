<script>
  import { modalContent, modalProps } from "../../../../stores.js";
  import NewQuestionnaireModal from "../../../../components/NewQuestionnaireModal.svelte";

  const newQuestionnaire = () => {
    modalContent.set(NewQuestionnaireModal);
    modalProps.set({});
  };
</script>

<section class="contentWrapper">
  <h2>Brainstorm</h2>
  <p class="infoBlurb">...</p>
  <button on:click={newQuestionnaire} class="button button-success">
    Create questionnaire
  </button>
</section>
<section class="contentWrapper">List of draft questionnaires</section>
