<script context="module">
  import { get } from "../../api.js";
  export async function preload({ path }, session) {
    if (!session.user) {
      return this.redirect(302, `/login?redirect=${encodeURIComponent(path)}`);
    }
    const user = await get(`/users/${session.user.id}`, session.user.jwt);
    return { user };
  }
</script>

<script>
  import MdArrowBack from "svelte-icons/md/MdArrowBack.svelte";
  import { stores } from "@sapper/app";
  const { page, session } = stores();

  export let user;
</script>

<style>
  @media (min-width: 750px) {
    div.userColumnLeft {
      position: fixed;
      top: 5rem; /* nav height */
      left: 0;
      bottom: 0;
      width: var(--sidebarWidth);
      box-shadow: 0.2rem 0 0.6rem 0 rgba(0, 0, 0, 0.1);
    }
    div.userColumnRight {
      position: fixed;
      top: 5rem; /* nav height */
      right: 0;
      bottom: 0;
      width: calc(100% - var(--sidebarWidth));
      border-top: 0.1rem solid var(--borderColor);
    }
  }

  div.userColumnLeft {
    transition: transform 0.2s ease;
    border-top: 0.1rem solid var(--borderColor);
    border-right: 0.1rem solid var(--borderColor);
    padding: 1.5rem;
    text-align: center;
    background-color: var(--background1);
  }
  div.userColumnRight {
    overflow-y: scroll;
    background-color: var(--backdrop);
    transition: width 0.2s ease;
    padding-top: 1.5rem;
  }
  div.profileImageWrapper {
    overflow: hidden;
    height: calc(var(--sidebarWidth) - 7rem);
    width: calc(var(--sidebarWidth) - 7rem);
    margin: 1rem auto 0;
    box-shadow: var(--boxShadow);
  }

  div.userColumnLeft .button {
    width: calc(var(--sidebarWidth) - 7rem);
    padding: 0;
  }

  h1 {
    margin-bottom: 0.7rem;
    font-size: 3.5rem;
  }

  div.emailAddress {
    color: var(--secondaryText);
    margin-bottom: 2.5rem;
  }

  .profileImageWrapper img,
  :global(.profileImageWrapper svg) {
    max-height: 100%;
    max-width: 100%;
  }
</style>

<svelte:head>
  <title>{user.name} - ReqWise</title>
</svelte:head>
<div>
  <div class="userColumnLeft">
    <div class="profileImageWrapper squircle">
      {#if $session.user.imageName}
        <img
          src={`https://storage.googleapis.com/user-file-storage/${$session.user.imageName}`}
          alt={user.name} />
      {:else}
        {@html user.placeholderImage}
      {/if}
    </div>
    <h1>{user.name}</h1>
    <div class="emailAddress">{user.email}</div>
    {#if !$page.path.includes('/account/settings')}
      <a
        rel="prefetch"
        href="/account/settings"
        class="button button-success button-outline">
        Settings
      </a>
    {:else}
      <a href="/account" class="button button-success button-outline">
        <div class="iconWrapper">
          <MdArrowBack />
        </div>
        Back to profile
      </a>
    {/if}
  </div>
  <div class="userColumnRight">
    <slot />
  </div>
</div>
