<script>
  import IoMdRibbon from "svelte-icons/io/IoMdRibbon.svelte";
  import IoMdCheckmarkCircleOutline from "svelte-icons/io/IoMdCheckmarkCircleOutline.svelte";
  import IoMdPeople from "svelte-icons/io/IoMdPeople.svelte";
  import MdHistory from "svelte-icons/md/MdHistory.svelte";
  import IoIosSettings from "svelte-icons/io/IoIosSettings.svelte";
  export let name;
  export let id;
  export let tab;

  import Skeleton from "../components/Skeleton.svelte";

  const tabs = [
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
  span.iconWrapper {
    height: 1.5rem;
    width: 1.5rem;
    margin-right: 0.5rem;
  }
  a {
    list-style-type: none;
    display: flex;
    align-items: center;
    height: 5rem;
    padding: 0 1rem;
    border: 0.1rem solid white;
    text-decoration: none !important;
  }
  a span {
    line-height: 2rem;
  }

  a.selected {
    background-color: #fafafa;
    border: 0.1rem solid #eee;
    border-radius: 0.6rem;
  }

  a:not(.selected) {
    color: var(--grey);
  }

  a:hover {
    color: var(--themeColor);
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 600;
    display: flex;
    height: 3rem;
    align-items: center;
    padding: 0 1rem;
  }
</style>

<h1>
  {#if name}
    {name}
  {:else}
    <Skeleton inline noPadding />
  {/if}
</h1>
<div>
  {#each tabs as item}
    <a
      href={`/project/${id}/${item.slug}`}
      class={tab === item.slug ? 'selected' : ''}>
      <span class="iconWrapper">
        <svelte:component this={item.icon} />
      </span>
      <span>{item.label}</span>
    </a>
  {/each}
</div>
