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
  import FaCheckDouble from "svelte-icons/fa/FaCheckDouble.svelte";

  export let name;
  export let id;
  export let tab;

  const tabs = [
    {
      label: "Brainstorm",
      slug: "brainstorm",
      icon: MdLightbulbOutline,
      newSection: true
    },
    {
      label: "Business Requirements",
      slug: "business-requirements",
      icon: FaBriefcase,
      newSection: true,
      extraPadding: true
    },
    {
      label: "Features",
      slug: "features",
      icon: FaCheck,
      extraPadding: true
    },
    {
      label: "Quality Attributes",
      slug: "quality-attributes",
      icon: IoMdRibbon
    },
    {
      label: "Diagrams and Files",
      slug: "files",
      icon: FaRegFileAlt,
      newSection: true,
      extraPadding: true
    },
    {
      label: "User Classes",
      slug: "user-classes",
      icon: IoMdPeople
    },
    {
      label: "Tests",
      slug: "tests",
      icon: FaCheckDouble,
      extraPadding: true
    },
    // {
    //   label: "Archived",
    //   slug: "archived",
    //   icon: FaArchive,
    //   newSection: true,
    //   extraPadding: true
    // },
    {
      label: "Stakeholders",
      slug: "stakeholders",
      icon: FaUserTie,
      newSection: true,
      extraPadding: true
    },
    {
      label: "Activity",
      slug: "activity",
      icon: MdHistory
    },
    {
      label: "Settings",
      slug: "settings",
      icon: IoIosSettings
    }
  ];
</script>

<style>
  a {
    list-style-type: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 7rem;
    width: 9rem;
    padding: 0.5rem;
    text-align: center;
    text-decoration: none !important;
    margin: 0.5rem;
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
    font-size: 1.6rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    padding: 0.5rem 1.5rem 0;
    height: 5.5rem;
    margin-bottom: 0;
  }

  span.icon {
    float: right;
    height: 1.8rem;
    width: 1.8rem;
  }

  div.items {
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }

  nav {
    background-color: var(--background1);
    position: fixed;
    font-size: 1rem;
    box-shadow: var(--boxShadow);
    top: 4rem;
    z-index: 300000;
    left: 0.5rem;
    max-width: 40rem;
    display: flex;
    align-items: center;
    flex-direction: column;
    border-radius: 0.8rem;
  }

  span.icon.extraPadding {
    padding: 0.2rem;
  }
</style>

<nav>
  <h1>{name}</h1>
  <div class="items">
    {#each tabs as item (item.slug)}
      <a
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
