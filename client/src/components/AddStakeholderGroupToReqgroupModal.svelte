<script>
  import { stores } from "@sapper/app";
  import Select from "svelte-select";
  import { onMount } from "svelte";
  const { session } = stores();
  import { get, post } from "../api.js";
  import { reqgroupTypeLabels } from "../utils.js";
  import SubmitButton from "./SubmitButton.svelte";

  export let projectId;
  export let reqgroupType;
  export let reqgroupId;
  export let update;
  export let close;

  let allStakeholderGroups = [];
  let stakeholderGroupOptions = [];
  let currentStakeholderGroups = [];
  let selectedStakeholderGroupOptions;

  onMount(async () => {
    allStakeholderGroups = await get(
      `/projects/${projectId}/stakeholders`,
      $session.user && $session.user.jwt
    );

    stakeholderGroupOptions = allStakeholderGroups.map((f) => ({
      value: f.id,
      label: `#${f.ppuid} ${f.name}`,
    }));

    currentStakeholderGroups = await get(
      `/reqgroups/${reqgroupId}/stakeholders`,
      $session.user && $session.user.jwt
    );

    selectedStakeholderGroupOptions = currentStakeholderGroups.map((f) => ({
      value: f.id,
      label: `#${f.ppuid} ${f.name}`,
    }));
  });

  $: currentStakeholderGroupIds = currentStakeholderGroups.map((f) => f.id);
  $: stakeholderGroupsToAdd = selectedStakeholderGroupOptions
    ? selectedStakeholderGroupOptions
        .map((s) => s.value)
        .filter((id) => !currentStakeholderGroupIds.includes(id))
    : [];

  $: addStakeholderGroups = async () => {
    await Promise.all(
      stakeholderGroupsToAdd.map(
        async (stakeholderGroup_id) =>
          await post(
            `/reqgroups/${reqgroupId}/stakeholders`,
            { stakeholderGroup_id },
            $session.user && $session.user.jwt
          )
      )
    );
    await update();
    close();
  };
</script>

<h2>Link stakeholder groups to {reqgroupTypeLabels()[reqgroupType]}</h2>
<form>
  <fieldset>
    <Select
      inputAttributes={{ id: 'stakeholderGroup' }}
      isClearable={false}
      isSearchable={true}
      isMulti={true}
      items={stakeholderGroupOptions}
      bind:selectedValue={selectedStakeholderGroupOptions} />
  </fieldset>
  <SubmitButton handler={addStakeholderGroups}>
    Add stakeholder groups
  </SubmitButton>
</form>
