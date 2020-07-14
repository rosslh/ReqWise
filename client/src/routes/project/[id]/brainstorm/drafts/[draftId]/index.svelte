<script context="module">
  export async function preload(page, session) {
    const questionnaire = await get(
      `/questionnaires/${page.params.draftId}`,
      session.user && session.user.jwt
    );
    return { questionnaire };
  }
</script>

<script>
  import { get } from "../../../../../../api.js";

  export let questionnaire;
</script>

<section class="contentWrapper">
  <h2>
    Draft questionnaire:
    <em>{questionnaire.description}</em>
  </h2>
  <pre>{JSON.stringify(questionnaire, null, 2)}</pre>
</section>
