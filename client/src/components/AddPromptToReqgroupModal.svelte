<script>
  import { stores } from "@sapper/app";
  import Select from "svelte-select";
  import { onMount } from "svelte";
  const { session } = stores();
  import { get, post } from "../api.js";
  import { reqgroupTypeLabels } from "../utils.js";
  import SubmitButton from "./SubmitButton.svelte";

  export let projectId;
  export let reqgroupId;
  export let reqgroupType;
  export let update;
  export let close;

  let allPrompts = [];
  let promptOptions = [];
  let currentPrompts = [];
  let selectedPromptOptions;

  onMount(async () => {
    allPrompts = await get(
      `/projects/${projectId}/prompts`,
      $session.user && $session.user.jwt
    );

    promptOptions = allPrompts.map((f) => ({
      value: f.id,
      label: `#${f.ppuid} ${f.prompt}`,
    }));

    currentPrompts = await get(
      `/reqgroups/${reqgroupId}/prompts`,
      $session.user && $session.user.jwt
    );

    selectedPromptOptions = currentPrompts.map((f) => ({
      value: f.id,
      label: `#${f.ppuid} ${f.prompt}`,
    }));
  });

  $: currentPromptIds = currentPrompts.map((f) => f.id);
  $: promptsToAdd = selectedPromptOptions
    ? selectedPromptOptions
        .map((s) => s.value)
        .filter((id) => !currentPromptIds.includes(id))
    : [];

  $: addPrompts = async () => {
    await Promise.all(
      promptsToAdd.map(
        async (prompt_id) =>
          await post(
            `/reqgroups/${reqgroupId}/prompts`,
            { prompt_id },
            $session.user && $session.user.jwt
          )
      )
    );
    await update();
    close();
  };
</script>

<h2>Link prompts to {reqgroupTypeLabels[reqgroupType]}</h2>
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
  <SubmitButton handler={addPrompts}>Add prompts</SubmitButton>
</form>
