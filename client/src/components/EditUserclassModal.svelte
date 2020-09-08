<script>
  import Select from "svelte-select";
  import { put } from "../api.js";
  import normalizeString from "lodash/startCase";
  import { stores } from "@sapper/app";
  const { session } = stores();

  import SubmitButton from "../components/SubmitButton.svelte";
  import MdInfoOutline from "svelte-icons/md/MdInfoOutline.svelte";

  export let close;
  export let update;
  export let userclass;

  let { name, description, id, persona, importance, is_draft } = userclass;

  const importanceOptions = [
    "favored",
    "disfavored",
    "ignored",
    "other",
  ].map((attr) => ({ value: attr, label: normalizeString(attr) }));

  let newImportance = importanceOptions.find((x) => x.value === importance);

  $: save = async () => {
    await put(
      `/userclasses/${id}`,
      {
        name,
        description,
        persona,
        importance: newImportance.value,
        is_draft,
      },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };
</script>

<style>
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

<h3>Update user class details</h3>
<form>
  <fieldset>
    <label for="name">Name</label>
    <input type="text" id="name" bind:value={name} />
  </fieldset>
  <fieldset>
    <label for="desc">Description</label>
    <input type="text" id="desc" bind:value={description} />
  </fieldset>
  <fieldset>
    <label for="persona">
      User persona <a
        href="http://www.agilemodeling.com/artifacts/personas.htm"
        target="_blank"
        rel="noopener"
        class="personaInfoIcon">
        <MdInfoOutline />
      </a>
    </label>
    <textarea id="persona" bind:value={persona} />
  </fieldset>
  <fieldset>
    <label for="importance">Importance</label>
    <Select
      inputAttributes={{ id: 'importance' }}
      isCreatable={true}
      items={importanceOptions}
      bind:selectedValue={newImportance} />
  </fieldset>
  <fieldset>
    <input type="checkbox" id="isDraft" bind:checked={is_draft} />
    <label class="label-inline" for="isDraft">
      User class is a draft <span class="secondary">(not ready for stakeholder
        review)</span>
    </label>
  </fieldset>
  <SubmitButton className="button-caution" handler={save}>Save</SubmitButton>
</form>
