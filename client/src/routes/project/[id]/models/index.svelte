<script>
  import { stores } from "@sapper/app";

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
  <p>
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
