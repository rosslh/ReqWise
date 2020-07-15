<script>
  export let prompt;
  export let isDraft;
  export let isOpen;

  import { stores } from "@sapper/app";
  import Select from "svelte-select";

  const { session } = stores();

  import SubmitButton from "./SubmitButton.svelte";
  import { post } from "../api.js";

  let numericResponse = Math.round(
    (prompt.numericFloor + prompt.numericCeiling) / 2
  );

  let likertResponse = 3;

  let textResponse = "";

  const submit = async () => {
    const data = {};
    if (prompt.responseType === "number") {
      data.numericResponse = numericResponse;
    }
    await post(
      `/prompts/${prompt.id}/responses`,
      {},
      $session.user && $session.user.jwt
    );
  };

  const capitalizeFirstLetter = str =>
    str.charAt(0).toUpperCase() + str.slice(1);

  let options = prompt.options.map(option => ({
    label: capitalizeFirstLetter(option.value),
    value: option.value
  }));
  let selectedOption = options[0];
</script>

<style>
  form {
    padding: 2rem;
  }
  .secondary {
    color: var(--secondaryText);
    font-weight: 300;
  }

  ul.likertList {
    display: flex;
    padding: 0.5rem 0 0;
    margin-bottom: 0;
    flex-wrap: wrap;
  }

  ul.likertList li {
    list-style-type: none;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    justify-content: center;
    width: 9rem;
  }

  ul.likertList li label {
    text-align: center;
    font-size: 1.4rem;
    font-weight: 400;
    padding: 0.75rem;
  }
</style>

<form>
  {#if prompt.responseType === 'number'}
    <fieldset>
      <label for="responseNumber">
        Response
        <span class="secondary">
          (minimum: {prompt.numericFloor}, maximum: {prompt.numericCeiling})
        </span>
      </label>
      <input
        type="number"
        id="responseNumber"
        bind:value={numericResponse}
        min={prompt.numericFloor}
        max={prompt.numericCeiling} />
    </fieldset>
  {:else if prompt.responseType === 'text'}
    <fieldset>
      <label for="responseText">Response</label>
      <input id="responseText" type="text" bind:value={textResponse} />
    </fieldset>
  {:else if prompt.responseType === 'paragraph'}
    <fieldset>
      <label for="responseParagraph">Response</label>
      <textarea id="responseParagraph" bind:value={textResponse} />
    </fieldset>
  {:else if prompt.responseType === 'dropdown'}
    <fieldset>
      <label for="responseSelect">
        Response
        <span class="secondary">(select one)</span>
      </label>
      <Select
        inputAttributes={{ id: 'responseSelect' }}
        isClearable={false}
        items={options}
        bind:selectedValue={selectedOption} />
    </fieldset>
  {:else if prompt.responseType === 'likert'}
    <label for="responseLikert">Response</label>
    <fieldset>
      <ul class="likertList">
        <li>
          <label for="likertScale1">Strongly disagree</label>
          <input
            bind:group={likertResponse}
            name="likertScale"
            type="radio"
            id="likertScale1"
            value={1} />
        </li>
        <li>
          <label for="likertScale2">Somewhat disagree</label>
          <input
            bind:group={likertResponse}
            name="likertScale"
            type="radio"
            id="likertScale2"
            value={2} />
        </li>
        <li>
          <label for="likertScale3">Neutral / unsure</label>
          <input
            bind:group={likertResponse}
            name="likertScale"
            type="radio"
            id="likertScale3"
            value={3} />
        </li>
        <li>
          <label for="likertScale4">Somewhat agree</label>
          <input
            bind:group={likertResponse}
            name="likertScale"
            type="radio"
            id="likertScale4"
            value={4} />
        </li>
        <li>
          <label for="likertScale5">Strongly agree</label>
          <input
            bind:group={likertResponse}
            name="likertScale"
            type="radio"
            id="likertScale5"
            value={5} />
        </li>
      </ul>
    </fieldset>
  {/if}
  <SubmitButton disabled={isDraft || !isOpen} handler={submit}>
    Submit
  </SubmitButton>
</form>
