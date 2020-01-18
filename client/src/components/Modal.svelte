<script>
  import { modalContent, modalProps } from "../stores.js";

  const close = () => {
    modalContent.set(false);
    modalProps.set({});
  };
</script>

<style>
  div.backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 100;
  }
  div.contentWrapper {
    z-index: 200;
    background-color: white;
    padding: 3rem;
    border-radius: 0.4rem;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70rem;
    max-width: 95%;
  }
</style>

<div class="backdrop" on:click={close} />
<div class="modal">
  <div class="contentWrapper">
    <slot {close} />
  </div>
</div>
