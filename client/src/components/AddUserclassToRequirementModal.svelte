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

  let allUserclasses = [];
  let userclassOptions = [];
  let currentUserclasses = [];
  let selectedUserclassOptions;

  onMount(async () => {
    allUserclasses = await get(
      `/projects/${projectId}/userclasses`,
      $session.user && $session.user.jwt
    );

    userclassOptions = allUserclasses.map(f => ({
      value: f.id,
      label: `#${f.ppuid} ${f.name}`
    }));

    currentUserclasses = await get(
      `/requirements/${requirementId}/userclasses`,
      $session.user && $session.user.jwt
    );

    selectedUserclassOptions = currentUserclasses.map(f => ({
      value: f.id,
      label: `#${f.ppuid} ${f.name}`
    }));
  });

  $: currentUserclassIds = currentUserclasses.map(f => f.id);
  $: userclassesToAdd = selectedUserclassOptions
    ? selectedUserclassOptions
        .map(s => s.value)
        .filter(id => !currentUserclassIds.includes(id))
    : [];

  $: addUserclasses = async () => {
    await Promise.all(
      userclassesToAdd.map(
        async userclass_id =>
          await post(
            `/requirements/${requirementId}/userclasses`,
            { userclass_id },
            $session.user && $session.user.jwt
          )
      )
    );
    await update();
    close();
  };
</script>

<h2>Link user classes to requirement</h2>
<form>
  <fieldset>
    <Select
      inputAttributes={{ id: 'userclass' }}
      isClearable={false}
      isSearchable={true}
      isMulti={true}
      items={userclassOptions}
      bind:selectedValue={selectedUserclassOptions} />
  </fieldset>
  <SubmitButton handler={addUserclasses}>Add userclasses</SubmitButton>
</form>
