<script>
  import { onMount, onDestroy } from "svelte";
  export let newFeature;
  export let addTeam;

  let exampleVisible = true;
  let inputActive = false;
  let interval;

  let exampleFeatureIndex = 0;
  $: currentExampleFeature = exampleFeatures[exampleFeatureIndex];

  const exampleFeatures = [
    "Users can post photos",
    "Admins can add members to teams",
    "The system will generate weekly performance reports",
    "Users will receive daily update emails"
  ];

  onDestroy(() => {
    clearInterval(interval);
  });

  onMount(() => {
    interval = setInterval(() => {
      exampleVisible = false;
      setTimeout(() => {
        exampleFeatureIndex =
          (exampleFeatureIndex + 1) % exampleFeatures.length;
        exampleVisible = true;
      }, 400);
    }, 8000);
    return () => {
      clearInterval(interval);
    };
  });
</script>

<style>
  input.newFeatureInput {
    width: calc(100% - 10rem);
    background-color: none;
    z-index: 2;
  }
  fieldset {
    display: flex;
    align-items: center;
    margin: 0 -0.2rem;
    position: relative;
  }
  fieldset > * {
    margin: 0 0.2rem;
  }

  button {
    width: 10rem;
  }

  .example {
    position: absolute;
    top: 1.9rem;
    left: 1rem;
    transform: translateY(-50%);
    z-index: 1;
    transition: opacity 0.3s ease;
  }

  .example.hidden {
    opacity: 0;
  }

  .example.hideInstantly {
    transition: none;
    opacity: 0;
  }
</style>

<form>
  <label for="newFeature">Add a feature</label>
  <fieldset>
    <div
      class={`example ${inputActive || newFeature ? 'hideInstantly' : ''} ${exampleVisible ? '' : 'hidden'}`}>
      e.g. {currentExampleFeature}
    </div>
    <input
      type="text"
      id="newFeature"
      name="newFeature"
      class="newFeatureInput"
      on:focus={() => {
        inputActive = true;
      }}
      on:blur={() => {
        inputActive = false;
      }}
      bind:value={newFeature} />
    <button on:click={addTeam}>+ Add</button>
  </fieldset>
</form>
