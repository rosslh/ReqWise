<script>
  import DiagramEditor from "../../../../components/DiagramEditor.svelte";
  import { goto, stores } from "@sapper/app";
  const { session, page } = stores();
  const { id: projectId } = $page.params;
  import { post } from "../../../../api.js";
  import SubmitButton from "../../../../components/SubmitButton.svelte";

  let name = "";
  let description = "";

  let editing = false;
  const startEditing = () => {
    editing = true;
  };

  const onSave = async svg => {
    await post(
      `/projects/${projectId}/models`,
      {
        name,
        description,
        svg
      },
      $session.user && $session.user.jwt
    );
    goto(`/project/${projectId}/models`);
  };
</script>

<section class="contentWrapper">
  <h2>Create diagram</h2>
  {#if editing}
    <DiagramEditor initialSvg={null} callback={onSave} title={name} />
  {:else}
    <form>
      <fieldset>
        <label for="name">Diagram name</label>
        <input id="name" bind:value={name} type="text" />
      </fieldset>
      <fieldset>
        <label for="desc">Description</label>
        <input id="desc" bind:value={description} type="text" />
      </fieldset>
      <SubmitButton handler={startEditing}>Start editing</SubmitButton>
    </form>
  {/if}
</section>
