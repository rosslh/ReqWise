<script>
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let selectedReqs;
  export let close;
  export let update;

  import Select from "svelte-select";

  import { post } from "../api.js";

  const statusOptions = [
    { value: "proposed", label: "Proposed" },
    { value: "accepted", label: "Accepted" }
    // { value: "inProgress", label: "In Progress" },
    // { value: "implemented", label: "Implemented" }
  ];

  let status = statusOptions[0];
  let rationale = "";

  const updateRequirements = async () => {
    await Promise.all(
      selectedReqs.map(id =>
        post(
          `/requirements/${id}/versions`,
          {
            status: status.value,
            rationale
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
<fieldset class="inline">
  <label for="status">Status</label>
  <div class="selectWrapper">
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
<button class="button-caution" on:click={updateRequirements}>Update</button>
