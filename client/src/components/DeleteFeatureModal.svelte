<script>
  import { del } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let reqgroupId;
  export let update;
  export let close;

  $: deleteFeature = async e => {
    await del(`/reqgroups/${reqgroupId}`, $session.user && $session.user.jwt);
    await update();
    close();
  };
</script>

<style>

</style>

<h3>Delete Feature</h3>
<p>The reqgroup's requirements will be archived.</p>
<button class="button-danger" on:click={deleteFeature}>Delete</button>
