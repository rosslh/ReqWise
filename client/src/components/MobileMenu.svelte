<script>
  import { onMount, onDestroy } from "svelte";
  import { menuHidden } from "../stores.js";

  export let name;
  export let id;
  export let tab;
  export let menuLinks;

  const close = () => {
    $menuHidden = true;
  };

  let navMenu;

  const onClick = (e) => e.stopPropagation();

  onMount(() => {
    document.addEventListener("click", close);
    navMenu.addEventListener("click", onClick);
  });

  onDestroy(() => {
    document.removeEventListener("click", close);
    navMenu.removeEventListener("click", onClick);
  });
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
    padding: 0.5rem;
    align-items: center;
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
    border: 0.1rem solid var(--borderColor);
    top: 4rem;
    z-index: 300000;
    left: 0.5rem;
    max-width: min(95vw, 33rem);
    max-height: calc(98vh - 5rem);
    overflow-y: scroll;
    display: flex;
    align-items: center;
    flex-direction: column;
    border-radius: 0.8rem;
  }

  span.icon.extraPadding {
    padding: 0.2rem;
  }
</style>

<nav tabindex={0} bind:this={navMenu}>
  <h1>{name}</h1>
  <div class="items">
    {#each menuLinks as item, i (item.slug)}
      <a
        tabindex={i + 1}
        on:click={close}
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
