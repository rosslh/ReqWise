<script>
  import { del } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let file;
  export let update;
  export let close;

  $: deleteFile = async () => {
    await del(`/files/${file.id}`, $session.user && $session.user.jwt);
    await update();
    close();
  };
</script>

<style>

</style>

<h3>Delete File</h3>
<p>This action cannot be undone.</p>
<button class="button-danger" on:click={deleteFile}>Delete</button>
