<script>
  import { del } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let model;
  export let update;
  export let close;

  $: deleteModel = async () => {
    await del(`/models/${model.id}`, $session.user && $session.user.jwt);
    await update();
    close();
  };
</script>

<style>

</style>

<h3>Delete Model</h3>
<p>This action cannot be undone.</p>
<button class="button-danger" on:click={deleteModel}>Delete</button>
