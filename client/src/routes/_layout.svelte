<script>
  import { stores } from "@sapper/app";
  import { modalContent, modalProps } from "../stores.js";
  import Modal from "../components/Modal.svelte";
  import Nav from "../components/Nav.svelte";

  const { session } = stores();

  $: $session.user &&
    typeof window !== "undefined" &&
    document.body.setAttribute(
      "data-theme",
      $session.user.darkModeEnabled ? "dark" : "light"
    );
</script>

<style>
  main {
    position: relative;
  }
</style>

{#if $modalContent}
  <Modal let:close>
    <svelte:component this={$modalContent} {...$modalProps} {close} />
  </Modal>
{/if}
<Nav />
<main>
  <slot />
</main>
