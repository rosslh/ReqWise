<script>
  import { put } from "../api.js";
  import { reqgroupTypeLabels } from "../utils.js";
  import { stores } from "@sapper/app";
  import capitalize from "lodash/capitalize";
  const { session } = stores();
  import SubmitButton from "../components/SubmitButton.svelte";

  export let reqgroupId;
  export let reqgroupType;
  export let updateReqgroup;
  export let close;

  export let reqgroup;
  let { name, isPrioritized, is_draft } = reqgroup;

  $: update = async () => {
    await put(
      `/reqgroups/${reqgroupId}`,
      {
        name,
        isPrioritized,
        is_draft,
      },
      $session.user && $session.user.jwt
    );
    updateReqgroup();
    close();
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<h3>Update {reqgroupTypeLabels[reqgroupType]}</h3>
<form>
  <fieldset>
    <label for="desc">Title</label>
    <input
      type="text"
      id="desc"
      name="desc"
      class="newReqInput"
      bind:value={name} />
  </fieldset>
  <fieldset>
    <input type="checkbox" id="isPrioritized" bind:checked={isPrioritized} />
    <label class="label-inline" for="isPrioritized">
      Requirements are prioritizable
    </label>
  </fieldset>
  <fieldset>
    <input type="checkbox" id="isDraft" bind:checked={is_draft} />
    <label class="label-inline" for="isDraft">
      {capitalize(reqgroupTypeLabels[reqgroupType])} is a draft <span
        class="secondary">(not ready for stakeholder review)</span>
    </label>
  </fieldset>
  <SubmitButton
    id="updateReqgroupButton"
    className="button-caution"
    handler={update}>
    Save
  </SubmitButton>
</form>
