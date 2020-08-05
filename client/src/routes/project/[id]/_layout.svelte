<script context="module">
  import { get } from "../../../api.js";
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
  import MobileMenu from "../../../components/MobileMenu.svelte";
  import { onMount, onDestroy, setContext } from "svelte";
  import { stores } from "@sapper/app";
  import {
    menuHidden,
    reqgroupsToUpdate,
    projectShouldUpdate,
    currentProjectId,
    media,
  } from "../../../stores.js";
  import { stream } from "../../../api.js";

  export let project;

  setContext("scopes", project.scopes);

  const { page, session } = stores();

  $: ({ path, params } = $page);
  $: tab = path.split("/").slice(3).join("/");
  $: id = params.id;

  let closeStream;

  $: startStream = function () {
    if (closeStream) {
      closeStream();
    }
    if (id) {
      closeStream = stream(
        "getProjectNotifications",
        { projectId: id },
        $session.user.jwt,
        (event) => {
          const data = JSON.parse(event);
          if (data.projectUpdated) {
            $projectShouldUpdate = true;
          }
          if (data.updatedReqgroups.length) {
            $reqgroupsToUpdate = Array.from(
              new Set([...$reqgroupsToUpdate, ...data.updatedReqgroups])
            );
          }
        }
      );
    }
  };

  onMount(() => async () => {
    if ($session.user && $session.user.jwt) {
      startStream();
    }
  });

  onDestroy(function () {
    if (closeStream) {
      closeStream();
    }
  });

  $: {
    $currentProjectId = id;
  }

  $: {
    if (
      typeof window !== "undefined" &&
      !closeStream &&
      $session.user &&
      $session.user.jwt
    ) {
      startStream();
    }
  }

  $: {
    if ($media.small) {
      $menuHidden = true;
    } else {
      $menuHidden = false;
    }
  }
</script>

<style>
  div.pageContent {
    overflow-y: scroll;
    background-color: var(--backdrop);
    border-top: 0.1rem solid var(--borderColor);
    padding-top: 1.5rem;
    transition: width 0.2s ease;
  }

  @media (min-width: 750px) {
    div.pageContent {
      width: calc(100% - var(--sidebarWidth));
      position: fixed;
      top: 5rem; /* nav height */
      right: 0;
      bottom: 0;
    }
    div.menuHidden div.pageContent {
      width: 100%;
    }

    div.menuContent {
      position: fixed;
      top: 5rem; /* nav height */
      left: 0;
      bottom: 0;
      width: var(--sidebarWidth);
      /* border-right: 0.1rem solid var(--borderColor); */
      transition: transform 0.2s ease;
      border-top: 0.1rem solid var(--borderColor);
    }

    div.menuHidden div.menuContent {
      transform: translateX(calc(-1 * var(--sidebarWidth)));
    }
  }

  @media (max-width: 749px) {
    div.menuHidden div.menuContent {
      display: none;
    }
  }

  :global(.pageContent p.infoBlurb) {
    color: var(--secondaryText);
    margin: 1.5rem 0 1.5rem;
    max-width: 70rem;
  }
</style>

<svelte:head>
  <title>{project.name} - ReqWise</title>
</svelte:head>
<div class={$menuHidden ? 'menuHidden' : 'sidebarVisible'}>
  <div class="pageContent">
    <slot />
  </div>
  <div class="menuContent">
    {#if !$media.small}
      <Sidebar {tab} {id} name={project.name} />
    {:else if !$menuHidden}
      <MobileMenu {tab} {id} name={project.name} />
    {/if}
  </div>
</div>
