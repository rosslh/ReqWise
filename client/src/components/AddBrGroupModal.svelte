<script>
  import Select from "svelte-select";
  import { post } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let id;
  export let update;
  export let close;

  $: addReqGroup = async e => {
    e.preventDefault();
    await post(
      `/projects/${id}/reqgroups`,
      {
        name: type.value,
        type: "business"
      },
      $session.user && $session.user.jwt
    );
    update();
    close();
  };

  const capitalizeFirstLetter = str =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const typeOptions = [
    "Business opportunity",
    "Business objectives",
    "Success metrics",
    "Vision statement",
    "Business risks",
    "Business assumptions and dependencies"
  ].map(attr => ({ value: attr, label: capitalizeFirstLetter(attr) }));

  let type = typeOptions[0];
</script>

<h3>Add a group of business requirements</h3>
<form>
  <fieldset>
    <label for="type">Business Requirement Type</label>
    <Select
      inputAttributes={{ id: 'type' }}
      isCreatable={true}
      items={typeOptions}
      bind:selectedValue={type} />
  </fieldset>
  <button class="button-create" on:click={addReqGroup}>+ Add</button>
</form>
