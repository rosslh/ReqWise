<script>
  import { post } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  import SubmitButton from "../components/SubmitButton.svelte";

  export let id;
  export let update;
  export let close;

  let description = "";
  let isPrioritized = true;

  $: addFeature = async () => {
    await post(
      `/projects/${id}/reqgroups`,
      {
        name: description,
        type: "feature",
        isPrioritized
      },
      $session.user && $session.user.jwt
    );
    update();
    close();
  };
</script>

<h3>Add a Feature</h3>
<form>
  <fieldset>
    <label for="desc">Title</label>
    <input
      type="text"
      id="desc"
      name="desc"
      class="newReqInput"
      bind:value={description} />
  </fieldset>
  <fieldset>
    <input type="checkbox" id="isPrioritized" bind:checked={isPrioritized} />
    <label class="label-inline" for="isPrioritized">
      Requirements are prioritizable
    </label>
  </fieldset>
  <SubmitButton id="addFeatureModalButton" handler={addFeature}>
    Add
  </SubmitButton>
</form>
