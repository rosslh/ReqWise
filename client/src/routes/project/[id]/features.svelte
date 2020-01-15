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
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
    consequat.
  </p>
  <AddFeature {update} {id} />
</section>
<section class="contentWrapper">
  {#if features}
    {#each features as feature}
      <Feature {feature} uri={`/projects/${id}/features/${feature.id}`} />
    {/each}
  {:else}
    <Feature />
  {/if}
</section>
