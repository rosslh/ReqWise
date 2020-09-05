<script>
  import { stores } from "@sapper/app";
  import Select from "svelte-select";
  import { onMount } from "svelte";
  const { session } = stores();
  import { get, post } from "../api.js";
  import SubmitButton from "./SubmitButton.svelte";

  export let projectId;
  export let userclassId;
  export let update;
  export let close;

  let allReqs = [];
  let reqOptions = [];
  let currentReqs = [];
  let selectedReqOptions;
  let details = "";

  onMount(async () => {
    allReqs = await get(
      `/projects/${projectId}/requirements`,
      $session.user && $session.user.jwt
    );
    reqOptions = allReqs.map((f) => ({
      value: f.id,
      label: `#${f.ppuid} ${f.description}`,
    }));
    currentReqs = await get(
      `/userclasses/${userclassId}/requirements`,
      $session.user && $session.user.jwt
    );
    selectedReqOptions = currentReqs.map((req) => ({
      value: req.id,
      label: `#${req.ppuid} ${req.description}`,
    }));
  });

  $: currentReqIds = currentReqs.map((f) => f.id);
  $: reqsToAdd = selectedReqOptions
    ? selectedReqOptions
        .map((s) => s.value)
        .filter((id) => !currentReqIds.includes(id))
    : [];

  $: addReqs = async () => {
    await Promise.all(
      reqsToAdd.map(
        async (req_id) =>
          await post(
            `/requirements/${req_id}/userclasses`,
            { userclass_id: userclassId, details },
            $session.user && $session.user.jwt
          )
      )
    );
    await update();
    close();
  };
</script>

<h2>Link requirements to userclass</h2>
<form>
  <fieldset>
    <Select
      inputAttributes={{ id: 'req' }}
      isClearable={false}
      isSearchable={true}
      isMulti={true}
      items={reqOptions}
      bind:selectedValue={selectedReqOptions} />
  </fieldset>
  <fieldset>
    <label for="details">Reason for linking</label>
    <input type="text" id="details" bind:value={details} />
  </fieldset>
  <SubmitButton handler={addReqs}>Add requirements</SubmitButton>
</form>
