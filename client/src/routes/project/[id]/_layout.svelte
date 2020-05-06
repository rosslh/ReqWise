<script context="module">
  export async function preload({ params, path }, { user }) {
    if (!user) {
      return this.redirect(302, `/login?redirect=${encodeURIComponent(path)}`);
    }
    const project = await get(`/projects/${params.id}`, user && user.jwt);
    return { project };
  }
</script>

<script>
  import Sidebar from "../../../components/Sidebar.svelte";
  import { onMount, onDestroy } from "svelte";
  import { stores } from "@sapper/app";
  import { currentProject, sidebarHidden } from "../../../stores.js";
  import { get } from "../../../api.js";
  export let project;
  $currentProject = project;
  const { page } = stores();
  $: ({ path, params } = $page);
  $: tab = path.split("/").pop();
  $: id = params.id;

  let title = null;

  const { session } = stores();

  let streamSource;

  $: startStream = () => {
    if ($currentProject) {
      const url = `${
        process.env.SAPPER_APP_API_URL
      }/stream/${id}?jwt=${encodeURIComponent($session.user.jwt)}`;

      streamSource = new EventSource(url);

      streamSource.onmessage = event => {
        alert(event.data);
      };

      streamSource.onerror = function(err) {
        console.error("EventSource failed:", err);
        streamSource.close();
        streamSource = undefined;
      };
    } else {
      console.log("No project selected");
    }
  };

  onMount(() => async () => {
    if ($session.user && $session.user.jwt) {
      startStream();
    }
  });

  onDestroy(() => {
    if (streamSource) {
      streamSource.close();
      streamSource = undefined;
    }
  });

  $: refreshStream =
    !streamSource && $session.user && $session.user.jwt && startStream();
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
      width: 100%;
    }
  }

  @media (max-width: 749px) {
    div.projectColumnRight {
      width: 100%;
    }
  }

  div.sidebarHidden div.projectColumnLeft {
    transform: translateX(calc(-1 * var(--sidebarWidth)));
  }

  :global(.projectColumnRight p.infoBlurb) {
    color: var(--grey4);
    margin: 1.5rem 0 1.5rem;
    max-width: 70rem;
  }
</style>

<div class={$sidebarHidden ? 'sidebarHidden' : 'sidebarVisible'}>
  <div class="projectColumnRight">
    <slot />
  </div>
  <div class="projectColumnLeft">
    <Sidebar {tab} {id} name={$currentProject.name} />
  </div>
</div>
