<script>
  import { stores } from "@sapper/app";
  import Select from "svelte-select";
  import { onMount } from "svelte";
  const { session } = stores();
  import { get, post } from "../api.js";
  import SubmitButton from "./SubmitButton.svelte";

  export let projectId;
  export let requirementId;
  export let update;
  export let close;

  let allPrompts = [];
  let promptOptions = [];
  let currentPrompts = [];
  let selectedPromptOptions;
  let details = "";

  onMount(async () => {
    allPrompts = await get(
      `/projects/${projectId}/prompts`,
      $session.user && $session.user.jwt
    );

    promptOptions = allPrompts.map(f => ({
      value: f.id,
      label: `#${f.ppuid} ${f.prompt}`
    }));

    currentPrompts = await get(
      `/requirements/${requirementId}/prompts`,
      $session.user && $session.user.jwt
    );

    selectedPromptOptions = currentPrompts.map(f => ({
      value: f.id,
      label: `#${f.ppuid} ${f.prompt}`
    }));
  });

  $: currentPromptIds = currentPrompts.map(f => f.id);
  $: promptsToAdd = selectedPromptOptions
    ? selectedPromptOptions
        .map(s => s.value)
        .filter(id => !currentPromptIds.includes(id))
    : [];

  $: addPrompts = async () => {
    await Promise.all(
      promptsToAdd.map(
        async prompt_id =>
          await post(
            `/requirements/${requirementId}/prompts`,
            { prompt_id, details },
            $session.user && $session.user.jwt
          )
      )
    );
    await update();
    close();
  };
</script>

<h2>Link prompts to requirement</h2>
<form>
  <fieldset>
    <Select
      inputAttributes={{ id: 'prompt' }}
      isClearable={false}
      isSearchable={true}
      isMulti={true}
      items={promptOptions}
      bind:selectedValue={selectedPromptOptions} />
  </fieldset>
  <fieldset>
    <label for="details">Reason for linking</label>
    <input type="text" id="details" bind:value={details} />
  </fieldset>
  <SubmitButton handler={addPrompts}>Add prompts</SubmitButton>
</form>
