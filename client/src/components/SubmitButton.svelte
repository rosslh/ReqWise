<script>
  export let handler;
  export let className;

  import FaSpinner from "svelte-icons/fa/FaSpinner.svelte";
  let spinning = false;
  const handleClick = async () => {
    spinning = true;
    await handler();
    spinning = false;
  };
</script>

<style>
  @keyframes spin {
    0% {
      transform: rotateZ(0);
    }
    100% {
      transform: rotateZ(360deg);
    }
  }
  .iconWrapper {
    height: 1.8rem;
    width: 1.8rem;
    margin: 0;
    padding: 0;
    animation-name: spin;
    animation-duration: 3000ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }
</style>

<button class={className} on:click|preventDefault={handleClick}>
  {#if spinning}
    <div class="iconWrapper">
      <FaSpinner />
    </div>
  {:else}
    <slot />
  {/if}
</button>
