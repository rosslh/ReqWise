<script>
  import { stores, goto } from "@sapper/app";

  import MdMenu from "svelte-icons/md/MdMenu.svelte";

  import { sidebarHidden } from "../stores.js";
  const { session, page } = stores();

  const logout = async () => {
    await fetch("auth/logout", {
      method: "POST",
      credentials: "include"
    });
    $session.user = undefined;
    // goto("/login");
  };
</script>

<style>
  nav {
    background-color: var(--background1);
  }
  div.contentWrapper {
    position: relative;
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

  div.menuButtonWrapper {
    height: 2.5rem;
    width: 2.5rem;
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
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
  }
</style>

<nav>
  <div class="contentWrapper">
    {#if $page.path.includes('/project/')}
      <div class="menuButtonWrapper">
        <button
          id="toggleMenu"
          on:click={() => {
            $sidebarHidden = !$sidebarHidden;
          }}>
          <MdMenu />
        </button>
      </div>
    {/if}
    <a class="logoWrapper" href=".">
      <img
        src={$session.user && $session.user.darkModeEnabled ? 'logo-white.png' : 'logo.png'}
        alt="ReqWise" />
    </a>
    <div class="right">
      {#if !$session.user || !$session.user.jwt}
        <a href="/sign-up/invite">Sign Up</a>

        <a href="/login">Login</a>
      {:else}
        <a href="/teams">My Teams</a>
        <a href="/settings">Settings</a>
        <button class="button button-small button-outline" on:click={logout}>
          Log out
        </button>
      {/if}
    </div>
  </div>
</nav>
