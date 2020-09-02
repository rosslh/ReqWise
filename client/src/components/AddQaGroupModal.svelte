<script>
  import Select from "svelte-select";
  import { post } from "../api.js";
  import normalizeString from "lodash/startcase";
  import { stores } from "@sapper/app";
  const { session } = stores();

  import SubmitButton from "../components/SubmitButton.svelte";

  export let id;
  export let update;
  export let close;

  $: addReqGroup = async () => {
    await post(
      `/projects/${id}/reqgroups`,
      {
        name: attribute.value,
        type: "quality",
      },
      $session.user && $session.user.jwt
    );
    update();
    close();
  };

  const attributeOptions = [
    "performance",
    "interoperability",
    "usability",
    "reliability",
    "availability",
    "security",
    "maintainability",
    "modifiability",
    "testability",
    "scalability",
    "reusability",
    "supportability",
  ].map((attr) => ({ value: attr, label: normalizeString(attr) }));

  let attribute = attributeOptions[0];
</script>

<style>
  .qaWrapper {
    min-height: 70vh;
  }
</style>

<div class="qaWrapper">
  <h3>Add a Quality Attribute</h3>
  <form>
    <fieldset>
      <label for="attribute">Quality Attribute</label>
      <Select
        inputAttributes={{ id: 'attribute' }}
        isCreatable={true}
        items={attributeOptions}
        bind:selectedValue={attribute} />
    </fieldset>
    <SubmitButton handler={addReqGroup}>Add</SubmitButton>
  </form>
</div>
