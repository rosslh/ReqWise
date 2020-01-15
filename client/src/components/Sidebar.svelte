<script>
  import IoMdRibbon from "svelte-icons/io/IoMdRibbon.svelte";
  import IoMdCheckmarkCircleOutline from "svelte-icons/io/IoMdCheckmarkCircleOutline.svelte";
  import IoMdPeople from "svelte-icons/io/IoMdPeople.svelte";
  import MdHistory from "svelte-icons/md/MdHistory.svelte";
  import MdLightbulbOutline from "svelte-icons/md/MdLightbulbOutline.svelte";
  import IoIosSettings from "svelte-icons/io/IoIosSettings.svelte";
  export let name;
  export let id;
  export let tab;

  import Skeleton from "../components/Skeleton.svelte";

  const tabs = [
    {
      label: "Brainstorm",
      slug: "brainstorm",
      icon: MdLightbulbOutline,
      newSection: true
    },
    {
      label: "Features",
      slug: "features",
      icon: IoMdCheckmarkCircleOutline,
      newSection: true
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
    font-size: 2.5rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    padding: 0.5rem 1.5rem 0;
    height: 5.5rem;
    margin-bottom: 0;
  }

  span.icon {
    float: right;
    height: 2rem;
    width: 2rem;
  }

  div.items {
    padding: 0 1.5rem;
  }

  div.separator {
    height: 1rem;
    border-top: 1px solid var(--grey1);
    margin-top: 1rem;
  }

  nav {
    background-color: white;
    height: 100%;
    overflow-y: scroll;
  }
</style>

<nav>
  <h1>
    {#if name}
      {name}
    {:else}
      <Skeleton inline noPadding />
    {/if}
  </h1>
  <div class="items">
    {#each tabs as item}
      {#if item.newSection}
        <div class="separator" />
      {/if}
      <a
        href={`/project/${id}/${item.slug}`}
        class={`${tab === item.slug ? 'selected' : ''}`}>
        <span>{item.label}</span>
        <span class="icon">
          <svelte:component this={item.icon} />
        </span>
      </a>
    {/each}
  </div>
</nav>
