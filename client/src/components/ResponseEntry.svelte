<script>
  import FaCheckCircle from "svelte-icons/fa/FaCheckCircle.svelte";

  export let option;
  export let totalCount;
</script>

<style>
  .barWrapper {
    max-width: 45rem;
    display: flex;
    align-items: center;
    height: 4rem;
    border-radius: 0.8rem;
    border: 0.1rem solid var(--borderColor);
    margin: 1rem 0.5rem 0;
    position: relative;
    background-color: var(--background2);
    overflow: hidden;
  }

  .optionBar {
    background-color: var(--grey2);
    height: 100%;
    position: absolute;
  }

  .optionCount {
    font-weight: 600;
  }

  .barWrapper > *:not(.optionBar) {
    z-index: 3;
    padding: 0 2rem;
  }

  .optionSelected {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-grow: 1;
  }

  .selectedIcon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.8rem;
  }

  :global(.selectedIcon svg) {
    max-height: 1.8rem;
    max-width: 1.8rem;
  }
</style>

<div class="barWrapper">
  <div
    class="optionBar"
    style={`width: ${(option.count / totalCount) * 100}%`} />
  <div class="optionCount">{option.count}</div>
  <div class="optionValue">{option.label || option.value}</div>
  <div class="optionSelected">
    {#if option.selectedByYou}
      <div class="selectedIcon">
        <FaCheckCircle />
      </div>
    {/if}
  </div>
</div>
