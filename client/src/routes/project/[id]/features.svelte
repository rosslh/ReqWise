<script>
  import { onMount } from "svelte";
  import { get, post } from "../../../api.js";
  import { stores } from "@sapper/app";

  import Feature from "../../../components/Feature.svelte";
  import AddFeature from "../../../components/AddFeature.svelte";

  const { page } = stores();
  const { id } = $page.params;
  let features = null;

  const update = async () => {
    get(`/projects/${id}/features`).then(r => {
      ({ features } = r);
    });
  };

  onMount(update);
</script>

<style>
  p.info {
    color: var(--grey4);
    margin: 1.5rem 0 1.5rem;
  }
</style>

<section class="contentWrapper">
  <h2>Features</h2>
  <p class="info">
    A feature is a group of related requirements that allows the user to satisfy
    a high-level objective or need.
    <br />
    Requirements tend to be more granular, and are written with implementation
    in mind.
  </p>
  <AddFeature {update} {id} />
</section>
<section class="contentWrapper">
  {#if features}
    {#each features as feature}
      <Feature {feature} {update} />
    {/each}
  {:else}
    <Feature />
  {/if}
</section>
