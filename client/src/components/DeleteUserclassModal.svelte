<script>
  import { del } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let userclass;
  export let update;
  export let close;

  $: deleteUserclass = async () => {
    await del(
      `/userclasses/${userclass.id}`,
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };
</script>

<style>

</style>

<h3>Delete User Class</h3>
<p>This action cannot be undone.</p>
<button class="button-danger" on:click={deleteUserclass}>Delete</button>
