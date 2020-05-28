<script context="module">
  export async function preload({ params, path }, { user }) {
    const model = await get(`/models/${params.model}`, user && user.jwt);
    return { model };
  }
</script>

<script>
  export let model;
  import { get, put } from "../../../../../api.js";
  import DiagramEditor from "../../../../../components/DiagramEditor.svelte";

  import { stores, goto } from "@sapper/app";
  const { session } = stores();

  $: onSave = async svg => {
    await put(
      `/models/${model.id}`,
      {
        svg
      },
      $session.user && $session.user.jwt
    );
    goto(`/project/${model.project_id}/models`);
  };
</script>

<section class="contentWrapper">
  <h2>Edit diagram</h2>
  <DiagramEditor initialSvg={model.svg} callback={onSave} title={model.name} />
</section>
