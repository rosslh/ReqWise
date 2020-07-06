<script>
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let selectedReqs;
  export let close;
  export let update;

  import Select from "svelte-select";
  import SubmitButton from "../components/SubmitButton.svelte";

  import { put } from "../api.js";

  const statusOptions = [
    { value: "proposed", label: "Proposed" },
    { value: "accepted", label: "Accepted" },
    { value: "modified", label: "Modified" },
    { value: "implemented", label: "Implemented" }
  ];

  let status = statusOptions[0];
  let rationale = "";

  const updateRequirements = async () => {
    await Promise.all(
      selectedReqs.map(({ id, reqversion_id }) =>
        put(
          `/reqversions/${reqversion_id}`,
          {
            status: status.value
          },
          $session.user && $session.user.jwt
        )
      )
    );

    await update();
    close();
  };
</script>

<h3>Update Status for Requirements</h3>
<form>
  <fieldset class="inline">
    <label for="status">Status</label>
    <div class="selectWrapper statusSelectWrapper">
      <Select
        inputAttributes={{ id: 'status' }}
        isClearable={false}
        isSearchable={false}
        items={statusOptions}
        bind:selectedValue={status} />
    </div>
  </fieldset>
  <fieldset>
    <label for="desc">Reason for change</label>
    <input
      type="text"
      id="rationale"
      name="rationale"
      class="newReqInput"
      bind:value={rationale} />
  </fieldset>
  <SubmitButton
    id="changeStatusSubmitButton"
    className="button-caution"
    handler={updateRequirements}>
    Update
  </SubmitButton>
</form>
