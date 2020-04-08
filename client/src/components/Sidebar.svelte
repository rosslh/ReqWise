<script>
  import IoMdRibbon from "svelte-icons/io/IoMdRibbon.svelte";
  import IoMdCheckmarkCircleOutline from "svelte-icons/io/IoMdCheckmarkCircleOutline.svelte";
  import IoMdPeople from "svelte-icons/io/IoMdPeople.svelte";
  import MdHistory from "svelte-icons/md/MdHistory.svelte";
  import MdLightbulbOutline from "svelte-icons/md/MdLightbulbOutline.svelte";
  import MdMenu from "svelte-icons/md/MdMenu.svelte";
  import MdClose from "svelte-icons/md/MdClose.svelte";
  import IoIosSettings from "svelte-icons/io/IoIosSettings.svelte";
  import FaArchive from "svelte-icons/fa/FaArchive.svelte";
  import FaBriefcase from "svelte-icons/fa/FaBriefcase.svelte";

  export let name;
  export let id;
  export let tab;
  export let sidebarHidden;

  import Skeleton from "../components/Skeleton.svelte";

  const tabs = [
    {
      label: "Brainstorm",
      slug: "brainstorm",
      icon: MdLightbulbOutline,
      newSection: true
    },
    {
      label: "Business Rules",
      slug: "business-rules",
      icon: FaBriefcase,
      newSection: true
    },
    {
      label: "Features",
      slug: "features",
      icon: IoMdCheckmarkCircleOutline
    },
    {
      label: "Quality Attributes",
      slug: "quality-attributes",
      icon: IoMdRibbon
    },
    {
      label: "User Classes",
      slug: "user-classes",
      icon: IoMdPeople
    },
    {
      label: "Archived",
      slug: "archived",
      icon: FaArchive,
      newSection: true
    },
    {
      label: "Activity",
      slug: "activity",
      icon: MdHistory,
      newSection: true
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
    justify-content: space-between;
    height: 5rem;
    padding: 0.5rem 0;
    text-decoration: none !important;
  }

  a.newSection {
    border-top: 1px solid var(--grey1);
  }
  a span {
    line-height: 2rem;
  }

  a:not(.selected) {
    color: var(--charcoal1);
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
    float: right;
    height: 1.8rem;
    width: 1.8rem;
  }

  div.items {
    padding: 0 1.5rem;
  }

  div.separator {
    height: 1rem;
    border-top: 1px solid var(--grey1);
    margin: 1rem -1.5rem 0;
  }

  nav {
    background-color: white;
    height: 100%;
    position: relative;
    overflow-y: auto;
    font-size: 1.5rem;
  }

  button#toggleMenu {
    background-color: white;
    border: none;
    color: var(--grey4);
    position: absolute;
    top: 0;
    right: 1rem;
    height: 3rem;
    width: 3rem;
    padding: 0;
    outline: none;
  }

  span.icon.archived,
  span.icon.business-rules {
    padding: 0.2rem;
  }
</style>

<nav>
  <button
    id="toggleMenu"
    on:click={() => {
      sidebarHidden = !sidebarHidden;
    }}>
    {#if sidebarHidden}
      <MdMenu />
    {:else}
      <MdClose />
    {/if}
  </button>
  <h1>
    {#if name}
      {name}
    {:else}
      <Skeleton height="2.4rem" inline noPadding />
    {/if}
  </h1>
  <div class="items">
    {#each tabs as item (item.slug)}
      {#if item.newSection}
        <div class="separator" />
      {/if}
      <a
        href={`/project/${id}/${item.slug}`}
        class={`${tab === item.slug ? 'selected' : ''}`}>
        <span>{item.label}</span>
        <span class={`icon ${item.slug}`}>
          <svelte:component this={item.icon} />
        </span>
      </a>
    {/each}
  </div>
</nav>
