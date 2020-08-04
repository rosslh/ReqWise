<script>
  export let isDraft;
</script>

<style>
  .indicator {
    position: relative;
    visibility: hidden;
    height: 5rem;
    width: 4rem;
    margin-top: -1.25rem;
    background-color: var(--secondaryText);
    color: var(--background1);
    font-size: 1.1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: var(--boxShadow);
    font-weight: 500;
  }
  .indicator.visible {
    visibility: visible;
  }

  .bottomTriangle {
    position: absolute;
    bottom: 0;
    width: 0;
    height: 0;
    border-left: 2rem solid transparent;
    border-right: 2rem solid transparent;
    border-bottom: 1rem solid var(--background1);
  }
</style>

<div class={`indicator ${isDraft ? 'visible' : ''}`}>
  Draft
  <div class="bottomTriangle" aria-hidden={true} />
</div>
