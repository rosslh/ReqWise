<script>
  import NProgress from "nprogress";
  import { stores } from "@sapper/app";
  import { modalContent, modalProps } from "../stores.js";
  import Modal from "../components/Modal.svelte";
  import Nav from "../components/Nav.svelte";

  const { session, preloading } = stores();
  NProgress.configure({
    minimum: 0.3,
    showSpinner: false
  });

  $: {
    if ($preloading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }
</script>

<style>
  main {
    position: relative;
    padding-top: 5rem; /* account for navbar */
    padding-bottom: 6rem;
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
<Nav />
<main>
  <slot />
</main>
