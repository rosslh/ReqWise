<script>
  import { stores, goto } from "@sapper/app";

  import MdMenu from "svelte-icons/md/MdMenu.svelte";
  import MdNotifications from "svelte-icons/md/MdNotifications.svelte";
  import TiHome from "svelte-icons/ti/TiHome.svelte";
  import GoSearch from "svelte-icons/go/GoSearch.svelte";

  import { sidebarHidden, currentProjectId } from "../stores.js";
  const { session, page } = stores();

  const logout = async () => {
    await fetch("auth/logout", {
      method: "POST",
      credentials: "include"
    });
    $session.user = null;
  };

  let searchQuery = "";

  $: search = () => {
    goto(
      `/project/${$currentProjectId}/search?q=${encodeURIComponent(
        searchQuery
      )}`
    );
  };
</script>

<style>
  nav {
    background-color: var(--background1);
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    z-index: 200;
  }
  div.contentWrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 5rem;
    max-width: unset;
    position: relative;
  }
  a.logoWrapper {
    display: inline-block;
    height: 3rem;
  }

  a.logoWrapper img {
    max-height: 100%;
    max-width: 100%;
  }

  form.middle {
    flex-grow: 1;
    padding: 0 3rem;
    max-width: 70rem;
    position: relative;
  }

  #navSearchBar {
    margin-bottom: 0;
    width: 100%;
    height: 3.2rem;
    border-radius: 0.4rem;
    flex-grow: 1;
    padding-left: 3.2rem;
  }

  .searchIconWrapper {
    display: inline-block;
    width: 1.6rem;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 3.6rem;
    display: flex;
    align-items: center;
    color: var(--secondaryText);
  }

  :global(.searchIconWrapper svg) {
    max-height: 1.6rem;
    max-width: 1.6rem;
  }

  div.right {
    height: 100%;
    display: flex;
    align-items: center;
  }

  div.right > * {
    display: inline-block;
    margin: 0 0.75rem;
  }

  .iconButton {
    background-color: var(--background1);
    border: none;
    color: var(--secondaryText);
    height: 2.2rem;
    width: 2.2rem;
    padding: 0;
    outline: none;
    margin: 0;
    margin-right: 1.5rem;
  }

  .iconButton:hover {
    background-color: var(--background2);
  }

  .logoMenuWrapper {
    display: flex;
    align-items: center;
  }

  .menuButton {
    position: absolute;
    left: 1rem;
  }
</style>

<nav>
  <div class="contentWrapper">
    {#if $page.path.includes('/project/')}
      <button
        class="iconButton menuButton"
        on:click={() => {
          $sidebarHidden = !$sidebarHidden;
        }}>
        <MdMenu />
      </button>
    {/if}
    <div class="logoMenuWrapper">
      <a rel="prefetch" class="logoWrapper" href=".">
        {#if $session.user && $session.user.theme === 'dark'}
          <img src="logo-white.png" alt="ReqWise" />
        {:else if $session.user && $session.user.theme === 'system'}
          <picture>
            <source
              srcset="logo-white.png"
              media="(prefers-color-scheme: dark)" />
            <img src="logo.png" alt="ReqWise" />
          </picture>
        {:else}
          <img src="logo.png" alt="ReqWise" />
        {/if}
      </a>
    </div>
    {#if $page.path.includes('/project/')}
      <form on:submit|preventDefault={search} class="middle">
        <div class="searchIconWrapper">
          <GoSearch />
        </div>
        <input
          bind:value={searchQuery}
          id="navSearchBar"
          type="text"
          placeholder="Search project" />
      </form>
    {/if}
    <div class="right">
      {#if !$session.user || !$session.user.jwt}
        <a rel="prefetch" id="signupLink" href="/sign-up/invite">Sign Up</a>

        <a rel="prefetch" id="loginLink" href="/login">Login</a>
      {:else}
        <a class="button iconButton" rel="prefetch" href="/notifications">
          <MdNotifications />
        </a>
        <a class="button iconButton" rel="prefetch" href="/account">
          <TiHome />
        </a>
        <button class="button button-small button-outline" on:click={logout}>
          Log out
        </button>
      {/if}
    </div>
  </div>
</nav>
