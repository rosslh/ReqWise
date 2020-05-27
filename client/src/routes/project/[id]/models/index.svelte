<script context="module">
  export async function preload({ params }, { user }) {
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

  const { page } = stores();
  const { id } = $page.params;
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
    <ModelPreview {model} />
  {/each}
</section>
