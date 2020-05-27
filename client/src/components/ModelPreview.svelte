<script>
  export let model;
</script>

<style>
  .modelPreview {
    border: 0.1rem solid var(--borderColor);
    border-radius: 0.4rem;
    margin: 2rem 0;
    background-color: var(--background1);
  }

  .diagramWrapper {
    height: 20rem;
    width: 100%;
    background-color: var(--background2);
    border-bottom: 0.1rem solid var(--borderColor);
    width: 100%;
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :global(.diagramWrapper svg) {
    max-height: 100%;
    max-width: 100%;
  }

  .textContent {
    padding: 2rem;
  }

  .textContent p {
    margin-bottom: 0;
  }

  .textContent h3 {
    margin-top: 0;
  }
</style>

<div class="modelPreview">
  <div class="diagramWrapper">
    {@html model.svg}
  </div>
  <div class="textContent">
    <h3>{model.name}</h3>
    <p>{model.description}</p>
  </div>
</div>
