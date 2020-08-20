<script>
  import NProgress from "nprogress";
  import { stores } from "@sapper/app";
  import { modalContent, modalProps } from "../stores.js";
  import Modal from "../components/Modal.svelte";
  import Nav from "../components/Nav.svelte";
  import { stream } from "../api.js";
  import { unreadAlerts } from "../stores.js";
  import { onMount, onDestroy } from "svelte";

  const { session, preloading } = stores();
  NProgress.configure({
    minimum: 0.25,
    trickleSpeed: 120,
    showSpinner: false,
  });

  $: {
    if ($preloading) {
      setTimeout(() => {
        if ($preloading) {
          NProgress.start();
        }
      }, 1000);
    } else {
      NProgress.done();
    }
  }

  let closeStream;

  $: startStream = function () {
    if (closeStream) {
      closeStream();
    }
    closeStream = stream(
      "getUserAlertStatus",
      {},
      $session.user.jwt,
      (event) => {
        $unreadAlerts = JSON.parse(event).unreadAlerts;
      }
    );
  };

  onMount(() => async () => {
    if ($session.user && $session.user.jwt) {
      startStream();
    }
  });

  onDestroy(function () {
    if (closeStream) {
      closeStream();
    }
  });

  $: {
    if (
      typeof window !== "undefined" &&
      !closeStream &&
      $session.user &&
      $session.user.jwt
    ) {
      startStream();
    }
  }
</script>

<style>
  main {
    position: relative;
    padding-top: 5rem; /* account for navbar */
    padding-bottom: 6rem;
  }

  div.environmentBanner {
    height: 2.25rem;
    color: white;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    z-index: 20000;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 1.4rem;
  }

  div.environmentBanner:hover {
    opacity: 0;
  }

  div.environmentBanner.qa {
    background-color: var(--orange);
  }

  div.environmentBanner.dev {
    background-color: var(--red);
  }
</style>

<svelte:head>
  {#if $session.user && $session.user.theme === 'dark'}
    <link rel="stylesheet" href="dark-mode.css" />
  {:else if $session.user && $session.user.theme === 'system'}
    <link rel="stylesheet" href="system-theme.css" />
  {/if}
</svelte:head>
{#if $modalContent}
  <Modal let:close>
    <svelte:component this={$modalContent} {...$modalProps} {close} />
  </Modal>
{/if}
{#if process.env.API_URL.includes('qa-dot-reqwise')}
  <div class="environmentBanner qa">QA Environment</div>
{:else if process.env.API_URL.includes('localhost')}
  <div class="environmentBanner dev">Development Environment</div>
{/if}
<Nav />
<main id={$preloading ? 'preloading' : ''}>
  <slot />
</main>
