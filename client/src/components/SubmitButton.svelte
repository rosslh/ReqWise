<script>
  export let handler;
  export let className;
  export let id;
  export let disabled;

  let btn;

  import FaSpinner from "svelte-icons/fa/FaSpinner.svelte";
  let spinning = false;
  const handleClick = async () => {
    const { height, width } = btn.getBoundingClientRect();
    btn.style.width = `${width}px`;
    btn.style.height = `${height}px`;
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

<button
  {id}
  class={`${className} submitButton`}
  {disabled}
  bind:this={btn}
  on:click|preventDefault={handleClick}>
  {#if spinning}
    <div class="iconWrapper loadingSpinner">
      <FaSpinner />
    </div>
  {:else}
    <slot />
  {/if}
</button>
