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

  let allFiles = [];
  let fileOptions = [];
  let currentFiles = [];
  let selectedFileOptions;

  onMount(async () => {
    allFiles = await get(
      `/projects/${projectId}/files`,
      $session.user && $session.user.jwt
    );

    fileOptions = allFiles.map(f => ({
      value: f.id,
      label: `#${f.ppuid} ${f.name}`
    }));

    currentFiles = await get(
      `/requirements/${requirementId}/files`,
      $session.user && $session.user.jwt
    );

    selectedFileOptions = currentFiles.map(f => ({
      value: f.id,
      label: `#${f.ppuid} ${f.name}`
    }));
  });

  $: currentFileIds = currentFiles.map(f => f.id);
  $: filesToAdd = selectedFileOptions
    ? selectedFileOptions
        .map(s => s.value)
        .filter(id => !currentFileIds.includes(id))
    : [];

  $: addFiles = async () => {
    await Promise.all(
      filesToAdd.map(
        async file_id =>
          await post(
            `/requirements/${requirementId}/files`,
            { file_id },
            $session.user && $session.user.jwt
          )
      )
    );
    await update();
    close();
  };
</script>

<h2>Link files to requirement</h2>
<form>
  <fieldset>
    <Select
      inputAttributes={{ id: 'file' }}
      isClearable={false}
      isSearchable={true}
      isMulti={true}
      items={fileOptions}
      bind:selectedValue={selectedFileOptions} />
  </fieldset>
  <SubmitButton handler={addFiles}>Add files</SubmitButton>
</form>
