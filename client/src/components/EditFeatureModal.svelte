<script>
  import { put } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();
  import SubmitButton from "../components/SubmitButton.svelte";

  export let reqgroupId;
  export let updateReqgroup;
  export let close;

  export let reqgroup;
  let { name, isPrioritized } = reqgroup;

  $: update = async () => {
    await put(
      `/reqgroups/${reqgroupId}`,
      {
        name,
        isPrioritized
      },
      $session.user && $session.user.jwt
    );
    updateReqgroup();
    close();
  };
</script>

<h3>Update requirement group</h3>
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
  <SubmitButton className="button-caution" handler={update}>Save</SubmitButton>
</form>
