<script>
  import { stores } from "@sapper/app";

  import MdMenu from "svelte-icons/md/MdMenu.svelte";

  import { sidebarHidden } from "../stores.js";
  const { session, page } = stores();

  const logout = async () => {
    await fetch("auth/logout", {
      method: "POST",
      credentials: "include"
    });
    $session.user = null;
    // goto("/login");
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
  }
  a.logoWrapper {
    display: inline-block;
    height: 3rem;
  }

  a.logoWrapper img {
    max-height: 100%;
    max-width: 100%;
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

  button#toggleMenu {
    background-color: var(--background1);
    border: none;
    color: var(--secondaryText);
    height: 2.5rem;
    width: 2.5rem;
    padding: 0;
    outline: none;
    margin: 0;
    margin-right: 1.5rem;
  }

  .logoMenuWrapper {
    display: flex;
    align-items: center;
  }
</style>

<nav>
  <div class="contentWrapper">
    <div class="logoMenuWrapper">
      {#if $page.path.includes('/project/')}
        <button
          id="toggleMenu"
          on:click={() => {
            $sidebarHidden = !$sidebarHidden;
          }}>
          <MdMenu />
        </button>
      {/if}
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
    <div class="right">
      {#if !$session.user || !$session.user.jwt}
        <a rel="prefetch" id="signupLink" href="/sign-up/invite">Sign Up</a>

        <a rel="prefetch" id="loginLink" href="/login">Login</a>
      {:else}
        <a rel="prefetch" href="/account">My Account</a>
        <a rel="prefetch" href="/account/settings">Settings</a>
        <button class="button button-small button-outline" on:click={logout}>
          Log out
        </button>
      {/if}
    </div>
  </div>
</nav>
