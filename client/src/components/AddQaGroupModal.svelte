<script>
  import Select from "svelte-select";
  import { post } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let id;
  export let update;
  export let close;

  $: addFeature = async e => {
    e.preventDefault();
    await post(
      `/projects/${id}/reqgroups`,
      {
        name: attribute.value,
        type: "quality"
      },
      $session.user && $session.user.jwt
    );
    update();
    close();
  };

  const capitalizeFirstLetter = str =>
    str.charAt(0).toUpperCase() + str.slice(1);

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
    "supportability"
  ].map(attr => ({ value: attr, label: capitalizeFirstLetter(attr) }));

  let attribute = attributeOptions[0];
</script>

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
  <button class="button-create" on:click={addFeature}>+ Add</button>
</form>
