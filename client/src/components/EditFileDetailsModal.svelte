<script>
  import { put } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  import SubmitButton from "../components/SubmitButton.svelte";

  export let close;
  export let update;
  export let file;

  let { name, description, id, url, is_draft } = file;

  $: save = async () => {
    await put(
      `/files/${id}`,
      {
        name,
        description,
        url,
        is_draft,
      },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };

  $: filetype = (() => {
    if (file.type === "diagram") {
      return "diagram";
    } else if (file.type === "upload") {
      return "file";
    } else {
      return "external resource";
    }
  })();
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<h3>Update {filetype} details</h3>
<form>
  <fieldset>
    <label for="name">Name</label>
    <input type="text" id="name" bind:value={name} />
  </fieldset>
  <fieldset>
    <label for="desc">Description</label>
    <input type="text" id="desc" bind:value={description} />
  </fieldset>
  {#if file.type === 'externalResource'}
    <fieldset>
      <label for="url">Resource URL</label>
      <input type="url" id="url" bind:value={url} />
    </fieldset>
  {/if}
  <fieldset>
    <input type="checkbox" id="isDraft" bind:checked={is_draft} />
    <label class="label-inline" for="isDraft">
      File is a draft
      <span class="secondary">(not ready for stakeholder review)</span>
    </label>
  </fieldset>
  <SubmitButton className="button-caution" handler={save}>Save</SubmitButton>
</form>
