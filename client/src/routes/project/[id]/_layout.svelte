<script context="module">
  export const preload = async ({ params }, { jwt }) => {
    const project = await get(`/projects/${params.id}`, jwt);
    return { project };
  };
</script>

<script>
  import Sidebar from "../../../components/Sidebar.svelte";
  import { stores } from "@sapper/app";
  import { currentProject } from "../../../stores.js";
  import { get } from "../../../api.js";
  export let project;
  $currentProject = project;
  const { page } = stores();
  $: ({ path, params } = $page);
  $: tab = path.split("/").pop();
  $: id = params.id;

  let title = null;
  let sidebarHidden = false;
</script>

<style>
  div.projectColumnLeft {
    position: fixed;
    top: 5rem; /* nav height */
    left: 0;
    bottom: 0;
    width: var(--sidebarWidth);
    border-right: 0.1rem solid var(--grey2);
    transition: transform 0.2s ease;
    border-top: 0.1rem solid var(--grey1);
  }
  div.projectColumnRight {
    position: fixed;
    top: 5rem; /* nav height */
    right: 0;
    bottom: 0;
    overflow-y: scroll;
    background-color: var(--offwhite2);
    border-top: 0.1rem solid var(--grey1);
    padding-top: 3.5rem;
    transition: width 0.2s ease;
  }

  @media (min-width: 750px) {
    div.projectColumnRight {
      width: calc(100% - var(--sidebarWidth));
    }
    div.sidebarHidden div.projectColumnRight {
      width: calc(100% - 5.5rem);
    }
  }

  @media (max-width: 749px) {
    div.projectColumnRight {
      width: 100%;
      padding-left: 5.5rem;
    }
  }

  div.sidebarHidden div.projectColumnLeft {
    transform: translateX(calc(-1 * var(--sidebarWidth) + 5.5rem));
  }
</style>

<div class={sidebarHidden ? 'sidebarHidden' : 'sidebarVisible'}>
  <div class="projectColumnRight">
    <slot />
  </div>
  <div class="projectColumnLeft">
    <Sidebar bind:sidebarHidden {tab} {id} name={$currentProject.name} />
  </div>
</div>
