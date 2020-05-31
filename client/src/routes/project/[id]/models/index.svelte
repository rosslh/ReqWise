<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../api.js";
  import ModelPreview from "../../../../components/ModelPreview.svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  let models = get(
    `/projects/${id}/models`,
    $session.user && $session.user.jwt
  );

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
{#await models}
  <!-- loading -->
{:then result}
  <section class="contentWrapper">
    {#each result as model (model.id)}
      <ModelPreview projectId={id} {model} {update} />
    {/each}
  </section>
{:catch error}
  <section class="contentWrapper">
    <p style="color: red">{error.message}</p>
  </section>
{/await}
