<script context="module">
  export async function preload({ params }, { user }) {
    if (!user) {
      return this.redirect(302, `/login?redirect=${encodeURIComponent(path)}`);
    }
    const { id } = params;
    const models = await get(`/projects/${id}/models`, user && user.jwt);
    return { models };
  }
</script>

<script>
  export let models;

  import { stores } from "@sapper/app";
  import { get } from "../../../../api.js";
  import ModelPreview from "../../../../components/ModelPreview.svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  const update = async () => {
    models = await get(
      `/projects/${id}/models`,
      $session.user && $session.user.jwt
    );
  };
</script>

<style>
  a#create-model-button {
    margin-right: 1.5rem;
  }
</style>

<section class="contentWrapper">
  <h2>Models and Diagrams</h2>
  <p class="infoBlurb">
    Visual models and diagrams provide a level of understanding and
    communication that goes beyond what textual representation of requirements
    can provide.
  </p>
  <a
    href={`/project/${id}/models/create`}
    class="button"
    id="create-model-button">
    Create Model
  </a>
  <button class="button button-outline">Upload Model</button>
</section>
<section class="contentWrapper">
  {#each models as model}
    <ModelPreview projectId={id} {model} {update} />
  {/each}
</section>
