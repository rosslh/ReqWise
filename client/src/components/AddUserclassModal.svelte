<script>
  import Select from "svelte-select";
  import { post } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();
  import MdInfoOutline from "svelte-icons/md/MdInfoOutline.svelte";

  import SubmitButton from "../components/SubmitButton.svelte";

  export let id;
  export let update;
  export let close;

  $: addReqGroup = async () => {
    await post(
      `/projects/${id}/userclasses`,
      {
        name,
        description: desc,
        persona,
        importance: importance.value,
      },
      $session.user && $session.user.jwt
    );
    update();
    close();
  };

  const capitalizeFirstLetter = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const importanceOptions = [
    "favored",
    "disfavored",
    "ignored",
    "other",
  ].map((attr) => ({ value: attr, label: capitalizeFirstLetter(attr) }));

  let importance = importanceOptions[0];
  let name = "";
  let desc = "";
  let persona = "";
</script>

<style>
  .modalWrapper {
    min-height: 70vh;
  }

  .personaInfoIcon {
    margin-left: 0.5rem;
    height: 1.8rem;
    width: 1.5rem;
    display: inline-block;
  }
  :global(.personaInfoIcon svg) {
    height: 1.5rem;
    width: 1.5rem;
  }
</style>

<div class="modalWrapper">
  <h3>Add a User Class</h3>
  <form>
    <fieldset>
      <label for="name">Name</label>
      <input type="text" bind:value={name} id="name" />
    </fieldset>
    <fieldset>
      <label for="desc">Description</label>
      <input type="text" bind:value={desc} id="desc" />
    </fieldset>
    <fieldset>
      <label for="persona">
        User persona
        <a
          href="http://www.agilemodeling.com/artifacts/personas.htm"
          target="_blank"
          rel="noopener"
          class="personaInfoIcon">
          <MdInfoOutline />
        </a>
      </label>
      <textarea bind:value={persona} id="persona" />
    </fieldset>
    <fieldset>
      <label for="importance">Importance</label>
      <Select
        inputAttributes={{ id: 'importance' }}
        isCreatable={true}
        items={importanceOptions}
        bind:selectedValue={importance} />
    </fieldset>
    <SubmitButton handler={addReqGroup}>Add</SubmitButton>
  </form>
</div>
