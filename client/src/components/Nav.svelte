<script>
  import { stores, goto } from "@sapper/app";
  import { fade } from "svelte/transition";

  import MdMenu from "svelte-icons/md/MdMenu.svelte";
  import MdNotifications from "svelte-icons/md/MdNotifications.svelte";
  import TiHome from "svelte-icons/ti/TiHome.svelte";
  import GoSearch from "svelte-icons/go/GoSearch.svelte";

  import {
    menuHidden,
    currentProjectId,
    unreadAlerts,
    media,
  } from "../stores.js";

  const { session, page } = stores();

  const logout = async () => {
    await fetch("auth/logout", {
      method: "POST",
      credentials: "include",
    });
    $session.user = null;
    location.reload();
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
  a.logoLink {
    display: inline-block;
    height: 3rem;
  }

  div.logoWrapper {
    position: relative;
  }

  div.logoWrapper span.betaLabel {
    position: absolute;
    top: 0;
    right: -1.75rem;
    color: var(--secondaryText);
    text-transform: uppercase;
    font-size: 1rem;
    user-select: none;
    font-weight: 500;
  }

  a.logoLink img {
    max-height: 100%;
    max-width: 100%;
  }

  form.middle {
    flex-grow: 1;
    padding: 0 0.5rem;
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
    left: 1.1rem;
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

  div.right.unauthed {
    justify-content: space-between;
    flex-grow: 1;
    max-width: 30rem;
    margin-left: 1rem;
    font-size: 1.4rem;
  }

  div.right > * {
    display: inline-block;
    margin-right: 0.5rem;
  }

  div.right > .logout {
    margin-right: 0;
    margin-top: 0;
  }

  .iconButton {
    background-color: var(--background1);
    border: none;
    color: var(--secondaryText);
    height: 3.2rem;
    width: 3.2rem;
    padding: 0.5rem;
    border-radius: 50%;
    outline: none;
    margin: 0;
    margin-right: 1.25rem;
  }

  .iconButton:hover {
    background-color: var(--background2);
  }

  .logoLink {
    display: flex;
    align-items: center;
    padding: 0 0.5rem;
    margin-right: 0.5rem;
  }

  .menuButton {
    position: absolute;
    left: 1rem;
  }

  #notificationButton {
    position: relative;
  }

  #notificationButton .alertIndicator {
    background-color: var(--themeColor);
    border-radius: 50%;
    height: 1.2rem;
    width: 1.2rem;
    position: absolute;
    top: 0.2rem;
    right: 0.4rem;
    border: 0.1rem solid var(--borderColor);
  }

  .navLink {
    color: var(--normalText);
    font-weight: 500;
    margin-left: 1rem;
  }
</style>

<nav>
  <div class="contentWrapper">
    {#if $page.path.includes('/project/')}
      <button
        class="iconButton menuButton"
        on:click={(e) => {
          e.stopPropagation();
          $menuHidden = !$menuHidden;
        }}>
        <MdMenu />
      </button>
    {/if}
    <div class="logoWrapper">
      {#if !$media.small || !$session.user}
        <a rel="prefetch" class="logoLink" href=".">
          {#if $session.user && $session.user.theme === 'dark'}
            <img src="logo-white.png" alt="ReqWise" />
          {:else if $session.user && $session.user.theme === 'system'}
            <picture>
              <source
                srcset="logo-white.png"
                media="(prefers-color-scheme: dark)" />
              <img src="logo.png" alt="ReqWise" />
            </picture>
          {:else}<img src="logo.png" alt="ReqWise" />{/if}
        </a>
        {#if !$media.small}<span class="betaLabel">Beta</span>{/if}
      {/if}
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
    <div
      class={`right ${$session.user && $session.user.jwt ? '' : 'unauthed'}`}>
      {#if !($session.user && $session.user.jwt)}
        <a rel="prefetch" class="navLink" href="/features">Features</a>

        <a rel="prefetch" class="navLink" href="/blog">Blog</a>

        <a
          rel="prefetch"
          data-cy="signupLink"
          class="navLink"
          href="/sign-up/invite">Sign&nbsp;Up</a>

        <a
          rel="prefetch"
          data-cy="loginLink"
          class="navLink"
          href="/login">Login</a>
      {:else}
        <a
          id="notificationButton"
          class="button iconButton"
          rel="prefetch"
          href="/notifications">
          {#if $unreadAlerts}
            <div
              transition:fade|local={{ duration: 200 }}
              class="alertIndicator" />
          {/if}
          <MdNotifications />
        </a>
        <a class="button iconButton" rel="prefetch" href="/account">
          <TiHome />
        </a>
        <button
          class="logout button button-small button-outline"
          on:click={logout}>
          Log out
        </button>
      {/if}
    </div>
  </div>
</nav>
