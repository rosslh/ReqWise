<script>
  import { stores } from "@sapper/app";
  import { modalContent, modalProps } from "../stores.js";
  import Modal from "../components/Modal.svelte";
  import Nav from "../components/Nav.svelte";

  const { session } = stores();
</script>

<style>
  main {
    position: relative;
  }
</style>

<svelte:head>
  {#if $session.user && $session.user.darkModeEnabled}
    <link rel="stylesheet" href="dark-mode.css" />
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
