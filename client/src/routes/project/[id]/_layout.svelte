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
  import { onMount, onDestroy } from "svelte";
  import { stores } from "@sapper/app";
  import {
    sidebarHidden,
    reqgroupsToUpdate,
    projectShouldUpdate,
    currentProjectId
  } from "../../../stores.js";
  import { stream } from "../../../api.js";

  export let project;

  const { page, session } = stores();

  $: ({ path, params } = $page);
  $: tab = path
    .split("/")
    .slice(3)
    .join("/");
  $: id = params.id;

  let closeStream;

  $: startStream = function() {
    if (closeStream) {
      closeStream();
    }
    if (id) {
      closeStream = stream(
        "getProjectNotifications",
        { projectId: id },
        $session.user.jwt,
        event => {
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

  onDestroy(function() {
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
</script>

<style>
  div.projectColumnLeft {
    position: fixed;
    top: 5rem; /* nav height */
    left: 0;
    bottom: 0;
    width: var(--sidebarWidth);
    /* border-right: 0.1rem solid var(--borderColor); */
    transition: transform 0.2s ease;
    border-top: 0.1rem solid var(--borderColor);
  }
  div.projectColumnRight {
    position: fixed;
    top: 5rem; /* nav height */
    right: 0;
    bottom: 0;
    overflow-y: scroll;
    background-color: var(--backdrop);
    border-top: 0.1rem solid var(--borderColor);
    padding-top: 1.5rem;
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
    color: var(--secondaryText);
    margin: 1.5rem 0 1.5rem;
    max-width: 70rem;
  }
</style>

<svelte:head>
  <title>{project.name} - ReqWise</title>
</svelte:head>
<div class={$sidebarHidden ? 'sidebarHidden' : 'sidebarVisible'}>
  <div class="projectColumnRight">
    <slot />
  </div>
  <div class="projectColumnLeft">
    <Sidebar {tab} {id} name={project.name} />
  </div>
</div>
