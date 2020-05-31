<script>
  import { stores } from "@sapper/app";
  const { session } = stores();

  import SubmitButton from "../components/SubmitButton.svelte";

  export let selectedReqs;
  export let close;
  export let update;

  import Select from "svelte-select";

  import { post } from "../api.js";

  const priorityOptions = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
  ];

  let priority = priorityOptions[1];
  let repropose = true;
  let rationale = "";

  const updateRequirements = async () => {
    await Promise.all(
      selectedReqs.map(id =>
        post(
          `/requirements/${id}/versions`,
          {
            priority: priority.value,
            rationale,
            status: repropose ? "proposed" : undefined
          },
          $session.user && $session.user.jwt
        )
      )
    );

    await update();
    close();
  };
</script>

<style>
  .proposed {
    color: var(--red);
    font-weight: 600;
  }
</style>

<h3>Update Priority for Requirements</h3>
<form>
  <fieldset class="inline">
    <label for="priority">Priority</label>
    <div class="selectWrapper">
      <Select
        inputAttributes={{ id: 'priority' }}
        isClearable={false}
        isSearchable={false}
        items={priorityOptions}
        bind:selectedValue={priority} />
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
  <fieldset>
    <input id="repropose" type="checkbox" bind:checked={repropose} />
    <label class="label-inline" for="repropose">
      Change status to
      <span class="proposed">Proposed</span>
    </label>
  </fieldset>
  <SubmitButton className="button-caution" handler={updateRequirements}>
    Update
  </SubmitButton>
</form>
