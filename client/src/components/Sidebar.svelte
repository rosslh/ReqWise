<script>
  export let name;
  export let id;
  export let tab;
  export let menuLinks;
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
    background-color: var(--background2);
  }

  h1 {
    font-size: 2.1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    padding: 0.5rem 1.5rem 0;
    min-height: 5.5rem;
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
    padding: 1rem 1.5rem 0.5rem;
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
    {#each menuLinks as item (item.slug)}
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
