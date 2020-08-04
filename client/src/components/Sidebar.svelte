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
  // import FaCheckDouble from "svelte-icons/fa/FaCheckDouble.svelte";

  export let name;
  export let id;
  export let tab;

  const tabs = [
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
      label: "External Stakeholders",
      slug: "stakeholders",
      icon: FaUserTie,
      newSection: "Project Details",
      extraPadding: true,
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
  ];
</script>

<style>
  a {
    list-style-type: none;
    display: flex;
    align-items: center;
    /* justify-content: space-between; */
    height: 3.75rem;
    padding: 0 1.5rem;
    text-decoration: none !important;
    font-size: 1.4rem;
  }
  a span {
    line-height: 2rem;
  }

  a:not(.selected) {
    color: var(--normalText);
  }

  a:hover {
    color: var(--themeColor);
  }

  h1 {
    font-size: 2.1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    padding: 0.5rem 1.5rem 0;
    height: 5.5rem;
    margin-bottom: 0;
  }

  span.icon {
    height: 1.8rem;
    width: 1.8rem;
    margin-right: 1rem;
  }

  div.items {
    padding: 0 0 1.5rem;
  }

  div.separator {
    border-top: 0.1rem solid var(--borderColor);
    margin: 1rem 0 0;
    font-weight: 600;
    padding: 1rem 1.5rem;
    opacity: 0.95;
    color: var(--secondaryText);
  }

  nav {
    background-color: var(--background1);
    height: 100%;
    position: relative;
    overflow-y: auto;
    font-size: 1.5rem;
    box-shadow: 0.2rem 0 0.6rem 0 rgba(0, 0, 0, 0.1);
  }

  span.icon.extraPadding {
    padding: 0.2rem;
  }
</style>

<nav>
  <h1>{name}</h1>
  <div class="items">
    {#each tabs as item (item.slug)}
      {#if item.newSection}
        <div class="separator">{item.newSection}</div>
      {/if}
      <a
        rel="prefetch"
        href={`/project/${id}/${item.slug}`}
        class={`${tab === item.slug ? 'selected' : ''}`}>
        <span
          class={`icon ${item.slug} ${item.extraPadding ? 'extraPadding' : ''}`}>
          <svelte:component this={item.icon} />
        </span>
        <span>{item.label}</span>
      </a>
    {/each}
  </div>
</nav>
