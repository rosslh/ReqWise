<script>
  import tippy from "sveltejs-tippy";
  import FaCheckCircle from "svelte-icons/fa/FaCheckCircle.svelte";

  export let option;
  export let totalCount;
  export let respondents;

  const tippyProps = {
    content: respondents.join(", "),
    allowHTML: true,
    placement: "top",
  };
</script>

<style>
  .barWrapper {
    max-width: 55rem;
    display: flex;
    align-items: center;
    height: 4rem;
    border-radius: 0.8rem;
    border: 0.1rem solid var(--borderColor);
    margin: 1rem 0.5rem 0;
    position: relative;
    background-color: var(--background1);
    overflow: hidden;
  }

  .optionBar {
    background-color: var(--grey1);
    height: 100%;
    position: absolute;
  }

  .optionBar.selected {
    background-color: var(--grey2);
  }

  .optionCount {
    font-weight: 600;
    margin: 0 2rem;
    padding: 0 0.5rem !important;
  }

  .optionCount.tippy {
    cursor: help;
    border-bottom: 0.15rem dashed var(--secondaryText);
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
    class={`optionBar ${option.selectedByYou ? 'selected' : ''}`}
    style={`width: ${(option.count / totalCount) * 100}%`} />
  {#if respondents.length}
    <div class="optionCount tippy" use:tippy={tippyProps}>{option.count}</div>
  {:else}
    <div class="optionCount">{option.count}</div>
  {/if}
  <div class="optionValue">{option.label || option.value}</div>
  <div class="optionSelected">
    {#if option.selectedByYou}
      <div class="selectedIcon">
        <FaCheckCircle />
      </div>
    {/if}
  </div>
</div>
