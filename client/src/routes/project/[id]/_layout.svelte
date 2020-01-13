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
  @media (min-width: 700px) {
    div.projectColumnLeft {
      position: fixed;
      top: 5rem; /* nav height */
      left: 0;
      bottom: 0;
      width: 25%;
      /* overflow-y: scroll; */
    }

    div.projectColumnRight {
      position: fixed;
      top: 5rem; /* nav height */
      right: 0;
      bottom: 0;
      width: 75%;
      overflow-y: scroll;
    }

    div.wrapper > * {
      padding: 1.5rem;
    }
  }

  @media (max-width: 699px) {
    div.wrapper > * {
      padding-top: 0;
    }
  }
</style>

<div class="wrapper">
  <div class="projectColumnLeft">
    <Sidebar {tab} {id} name={$currentProject.name} />
  </div>
  <div class="projectColumnRight">
    <div class="contentWrapper">
      <slot />
    </div>
  </div>
</div>
