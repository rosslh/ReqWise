<script context="module">
  export const preload = async ({ params }, { jwt }) => {
    const { id } = params;
    const features = await get(`/projects/${id}/features`, jwt);
    return { features };
  };
</script>

<script>
  import { onMount } from "svelte";
  import { get, post } from "../../../api.js";
  import { stores } from "@sapper/app";

  import Feature from "../../../components/Feature.svelte";
  import AddFeature from "../../../components/AddFeature.svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  export let features = [];

  const update = async () => {
    features = await get(`/projects/${id}/features`, $session.jwt);
  };
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
{#if features.length}
  <section class="contentWrapper">
    {#each features as feature (feature.id)}
      <Feature {feature} {update} />
    {/each}
  </section>
{/if}
