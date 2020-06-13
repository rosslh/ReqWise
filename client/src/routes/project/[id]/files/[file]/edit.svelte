<script context="module">
  import { get } from "../../../../../api.js";
  export async function preload({ params, _path }, { user }) {
    const file = await get(`/files/${params.file}`, user && user.jwt);
    return { file };
  }
</script>

<script>
  export let file;
  import { put } from "../../../../../api.js";
  import DiagramEditor from "../../../../../components/DiagramEditor.svelte";

  import { stores, goto } from "@sapper/app";
  const { session } = stores();

  $: onSave = async svg => {
    await put(
      `/files/${file.id}`,
      {
        svg
      },
      $session.user && $session.user.jwt
    );
    goto(`/project/${file.project_id}/files`);
  };
</script>

<section class="contentWrapper">
  <h2>Edit diagram</h2>
  <DiagramEditor initialSvg={file.svg} callback={onSave} title={file.name} />
</section>
