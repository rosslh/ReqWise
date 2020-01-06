<script>
  import Sidebar from "../../../components/Sidebar.svelte";
  import { stores } from "@sapper/app";
  import { currentProject } from "../../../stores.js";
  import { onMount } from "svelte";
  import { get } from "../../../api.js";

  const { page } = stores();
  $: ({ path, params } = $page);
  $: tab = path.split("/").pop();
  $: id = params.id;

  onMount(async () => {
    get(`/projects/${id}`).then(r => {
      currentProject.set(r);
    });
  });
</script>

<style>
  :global(.projectColumnRight h2) {
    font-size: 2rem;
  }
</style>

<div class="container">
  <div class="row">
    <div class="column column-25">
      <Sidebar {tab} {id} name={$currentProject.name} />
    </div>
    <div class="column column-35 projectColumnRight">
      <slot />
    </div>
  </div>
</div>
