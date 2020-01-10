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

<h1>Features</h1>
<section>
  <AddFeature {update} {id} />
</section>
<section>
  {#if features}
    {#each features as feature}
      <Feature {feature} uri={`/projects/${id}/features/${feature.id}`} />
    {/each}
  {:else}
    <Feature />
  {/if}
</section>
