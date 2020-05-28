<script>
  import FaSpinner from "svelte-icons/fa/FaSpinner.svelte";
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
  .spinnerContainer {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem 0;
  }
  .iconWrapper {
    color: var(--secondaryText);
    animation-name: spin;
    animation-duration: 5000ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    margin: 0 auto;
    height: 5rem;
    width: 5rem;
  }

  .hidden {
    visibility: hidden;
  }
</style>

<div class="spinnerContainer contentWrapper">
  <div class={`iconWrapper ${typeof window === 'undefined' ? 'hidden' : ''}`}>
    <FaSpinner />
  </div>
</div>
