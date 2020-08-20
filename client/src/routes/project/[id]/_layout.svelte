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
  import IoMdRibbon from "svelte-icons/io/IoMdRibbon.svelte";
  import FaCheck from "svelte-icons/fa/FaCheck.svelte";
  import IoMdPeople from "svelte-icons/io/IoMdPeople.svelte";
  import MdHistory from "svelte-icons/md/MdHistory.svelte";
  import MdLightbulbOutline from "svelte-icons/md/MdLightbulbOutline.svelte";
  import IoIosSettings from "svelte-icons/io/IoIosSettings.svelte";
  import FaRegFileAlt from "svelte-icons/fa/FaRegFileAlt.svelte";
  import FaBriefcase from "svelte-icons/fa/FaBriefcase.svelte";
  import FaUserTie from "svelte-icons/fa/FaUserTie.svelte";
  import FaSignature from "svelte-icons/fa/FaSignature.svelte";
  import FaEye from "svelte-icons/fa/FaEye.svelte";
  // import FaCheckDouble from "svelte-icons/fa/FaCheckDouble.svelte";

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

  const menuLinks = [
    {
      label: "Brainstorm",
      slug: "brainstorm",
      icon: MdLightbulbOutline,
      newSection: "Requirement Elicitation",
    },
    {
      label: "Business Requirements",
      slug: "business-requirements",
      icon: FaBriefcase,
      newSection: "Requirements",
      extraPadding: true,
    },
    {
      label: "Features",
      slug: "features",
      icon: FaCheck,
      extraPadding: true,
    },
    {
      label: "Quality Attributes",
      slug: "quality-attributes",
      icon: IoMdRibbon,
    },
    {
      label: "Diagrams and Files",
      slug: "files",
      icon: FaRegFileAlt,
      newSection: "Linkable",
      extraPadding: true,
    },
    {
      label: "User Classes",
      slug: "user-classes",
      icon: IoMdPeople,
    },
    // {
    //   label: "Tests",
    //   slug: "tests",
    //   icon: FaCheckDouble,
    //   extraPadding: true,
    // },
    {
      label: "Stakeholders",
      slug: "stakeholders",
      icon: FaUserTie,
      newSection: "Stakeholder Sign-Off",
      extraPadding: true,
    },
    {
      label: "Stakeholder Reviews",
      slug: "reviews",
      icon: FaEye,
      extraPadding: true,
    },
    {
      label: "Requirements Baseline",
      slug: "baseline",
      icon: FaSignature,
    },
    {
      label: "Activity",
      slug: "activity",
      icon: MdHistory,
      newSection: "Project Details",
    },
    {
      label: "Settings",
      slug: "settings",
      icon: IoIosSettings,
    },
  ];
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
      <Sidebar {tab} {id} name={project.name} {menuLinks} />
    {:else if !$menuHidden}
      <MobileMenu {tab} {id} name={project.name} {menuLinks} />
    {/if}
  </div>
</div>
