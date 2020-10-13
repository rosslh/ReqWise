<script context="module">
  import { get, put } from "../../../api.js";
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
  import MdDashboard from "svelte-icons/md/MdDashboard.svelte";

  import Sidebar from "../../../components/Sidebar.svelte";
  import Helmet from "../../../components/Helmet.svelte";
  import MobileMenu from "../../../components/MobileMenu.svelte";
  import { onMount, onDestroy, setContext } from "svelte";
  import { stores, goto } from "@sapper/app";
  import {
    menuHidden,
    reqgroupsToUpdate,
    projectShouldUpdate,
    currentProjectId,
    media,
  } from "../../../stores.js";
  import { stream } from "../../../api.js";
  import { showTourStage } from "../../../tour.js";

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

  const completeProjectTour = async () => {
    await put(
      `/users/${$session.user.id}/settings`,
      {
        doneProjectTour: true,
      },
      $session.user && $session.user.jwt
    );

    const result = await fetch("auth/updateSettings", {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify({ doneProjectTour: true }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((r) => r.json());
    $session.user = { ...$session.user, ...result };
    goto($page.path, { replaceState: true });
  };

  onMount(() => {
    if ($session.user && $session.user.jwt) {
      startStream();
    }
    if (
      typeof window !== "undefined" &&
      $session.user &&
      !$session.user.doneProjectTour &&
      project.scopes.includes("member")
    ) {
      import("intro.js").then(({ default: Intro }) => {
        const introjs = Intro();
        showTourStage(introjs, "project", completeProjectTour);
      });
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
      label: "Dashboard",
      slug: "dashboard",
      icon: MdDashboard,
      newSection: "Project Details",
    },
    {
      label: "Activity",
      slug: "activity",
      icon: MdHistory,
    },
    {
      label: "Settings",
      slug: "settings",
      icon: IoIosSettings,
    },
    {
      label: "Brainstorm",
      slug: "brainstorm",
      icon: MdLightbulbOutline,
      newSection: "Requirement Elicitation",
    },
    {
      label: "Business Considerations",
      slug: "business-considerations",
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
  ].filter(
    (item) => project.scopes.includes("admin") || item.slug !== "settings"
  );
</script>

<style>
  div.pageContent,
  div.menuContent {
    margin-top: 5rem;
  }

  div.pageContent {
    overflow-y: scroll;
    background-color: var(--backdrop);
    border-top: 0.1rem solid var(--borderColor);
    padding-top: 1.5rem;
    transition: width 0.2s ease;
  }

  #projectColumnWrapper {
    display: flex;
    height: 100%;
    margin-top: -5rem; /* account for navbar */
    margin-bottom: -6rem;
  }

  @media (min-width: 750px) {
    div.pageContent {
      width: calc(100% - var(--sidebarWidth));
      height: calc(100vh - 5rem);
    }
    div.menuHidden div.pageContent {
      width: 100%;
    }

    div.menuContent {
      height: calc(100vh - 5rem);
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

<Helmet title={`${project.name} - ReqWise`} description="A ReqWise project" />
<div
  id="projectColumnWrapper"
  class={$menuHidden ? 'menuHidden' : 'sidebarVisible'}>
  <div class="menuContent">
    {#if !$media.small}
      <Sidebar {tab} {id} name={project.name} {menuLinks} />
    {:else if !$menuHidden}
      <MobileMenu {tab} {id} name={project.name} {menuLinks} />
    {/if}
  </div>
  <div class="pageContent">
    <slot />
  </div>
</div>
