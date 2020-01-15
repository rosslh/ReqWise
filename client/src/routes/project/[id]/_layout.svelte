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

  let title = null;
  let sidebarVisible = false;
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
    div.sidebarVisible div.projectColumnRight {
      width: 100%;
    }
  }

  @media (max-width: 749px) {
    div.projectColumnRight {
      width: 100%;
      padding-left: 6rem;
    }
  }

  button.menuToggle {
    position: absolute;
    top: 0;
    left: 0.5rem;
    z-index: 300;
  }

  div.sidebarVisible div.projectColumnLeft {
    transform: translateX(calc(-1 * var(--sidebarWidth) + 6rem));
  }
</style>

<button
  class="menuToggle button-small"
  on:click={() => {
    sidebarVisible = !sidebarVisible;
  }}>
  {sidebarVisible ? 'Hide' : 'Show'}
</button>
<div class={sidebarVisible ? 'sidebarVisible' : 'sidebarHidden'}>
  <div class="projectColumnRight">
    <slot />
  </div>
  <div class="projectColumnLeft">
    <Sidebar {tab} {id} name={$currentProject.name} />
  </div>
</div>
