<script>
  import { stores } from "@sapper/app";
  const { session } = stores();
  import Select from "svelte-select";
  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";

  export let close;
  export let update;
  export let id;

  import { post } from "../api.js";
  import { normalizeString } from "../utils.js";

  import SubmitButton from "../components/SubmitButton.svelte";

  let prompt = "";

  const submitNewQuestionnaire = async () => {
    const data = { prompt, type: selectedType.value };
    if (selectedType.value === "number") {
      data.minVal = minVal;
      data.maxVal = maxVal;
    } else if (selectedType.value === "dropdown") {
      data.options = responseOptions;
    }

    await post(
      `/questionnaires/${id}/prompts`,
      data,
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };

  const typeOptions = ["text", "paragraph", "dropdown", "number", "likert"].map(
    (t) => {
      let label;

      if (t === "likert") {
        label = "Likert scale (strongly disagree to strongly agree)";
      } else {
        label = normalizeString(t);
      }
      return {
        label,
        value: t,
      };
    }
  );

  let selectedType = typeOptions[0];

  let minVal = 0;
  let maxVal = 10;
  let newOption = "";

  let responseOptions = [];

  $: addOption = () => {
    if (newOption) {
      responseOptions = [...responseOptions, newOption];
      newOption = "";
    }
  };
</script>

<style>
  .numericRangeColumns {
    display: flex;
    flex-wrap: wrap;
    margin: -1rem; /* account for child margin */
  }

  .numericRangeColumns > * {
    min-width: 30rem;
    margin: 1rem;
  }

  .addOptionWrapper {
    display: flex;
    align-items: center;
  }

  .addOptionWrapper > button {
    margin-left: 0.75rem;
  }

  .optionsPanel h4,
  .optionsPanel button {
    margin-top: 0;
  }

  .promptModalWrapper {
    min-height: 80vh;
  }
</style>

<div class="promptModalWrapper">
  <h3>Add prompt</h3>
  <form>
    <fieldset>
      <label for="prompt">Prompt / question</label>
      <input type="text" id="prompt" bind:value={prompt} />
    </fieldset>
    <fieldset>
      <label for="type">Response type</label>
      <Select
        inputAttributes={{ id: 'type' }}
        isClearable={false}
        items={typeOptions}
        bind:selectedValue={selectedType} />
    </fieldset>
    {#if selectedType.value === 'number'}
      <div class="numericRangeColumns">
        <fieldset>
          <label for="rangeMin">Minimum value</label>
          <input type="number" id="rangeMin" bind:value={minVal} />
        </fieldset>
        <fieldset>
          <label for="rangeMax">Maximum value</label>
          <input type="number" id="rangeMax" bind:value={maxVal} />
        </fieldset>
      </div>
    {:else if selectedType.value === 'dropdown'}
      <div class="panel optionsPanel">
        <h4>Response options</h4>
        <fieldset>
          <label for="newOption">New option</label>
          <div class="addOptionWrapper">
            <input type="text" id="newOption" bind:value={newOption} />
            <button on:click|preventDefault={addOption}>Add</button>
          </div>
        </fieldset>
        <table class="compact">
          <tbody>
            {#each responseOptions as option}
              <tr>
                <td>{option}</td>
                <td>
                  <button
                    class="button button-small button-danger button-outline
                      button-secondary">
                    <div class="iconWrapper">
                      <FaRegTrashAlt />
                    </div>
                    Delete option
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
    <fieldset>
      <SubmitButton handler={submitNewQuestionnaire}>Create</SubmitButton>
    </fieldset>
  </form>
</div>
