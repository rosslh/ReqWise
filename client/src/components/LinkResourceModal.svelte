<script>
  import { stores } from "@sapper/app";
  import normalizeUrl from "normalize-url";

  import { post, put } from "../api.js";
  import SubmitButton from "../components/SubmitButton.svelte";

  const { session } = stores();

  export let projectId;
  export let update;
  export let close;
  export let linkedResource;

  let name = linkedResource ? linkedResource.name : "";
  let description = linkedResource ? linkedResource.description : "";
  let url = linkedResource ? linkedResource.url : "";

  $: addResource = async () => {
    try {
      url = normalizeUrl(url);
    } catch (e) {
      /* pass */
    }
    if (linkedResource) {
      await put(
        `/files/${linkedResource.id}`,
        {
          name,
          description,
          url,
        },
        $session.user && $session.user.jwt
      );
      update();
      close();
    } else {
      await post(
        `/projects/${projectId}/files`,
        {
          name,
          description,
          url,
        },
        $session.user && $session.user.jwt
      );
      update();
      close();
    }
  };
</script>

<h3>Link an external resource</h3>
<form>
  <fieldset>
    <label for="name">Title</label>
    <input type="text" id="name" name="name" bind:value={name} />
  </fieldset>
  <fieldset>
    <label for="desc">Description</label>
    <input type="text" id="desc" name="desc" bind:value={description} />
  </fieldset>
  <fieldset>
    <label for="url">Resource URL</label>
    <input type="url" id="url" name="url" bind:value={url} />
  </fieldset>
  <SubmitButton handler={addResource}>Add</SubmitButton>
</form>
