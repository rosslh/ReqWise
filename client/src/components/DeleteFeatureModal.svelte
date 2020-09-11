<script>
  import { del } from "../api.js";
  import { reqgroupTypeLabels } from "../utils.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let reqgroupId;
  export let update;
  export let close;
  export let reqgroupType;

  $: deleteFeature = async () => {
    await del(`/reqgroups/${reqgroupId}`, $session.user && $session.user.jwt);
    await update();
    close();
  };
</script>

<style>
</style>

<h3>Delete {reqgroupTypeLabels()[reqgroupType]}</h3>
<p>Any associated reviews and requirements will also be deleted.</p>
<button
  id="confirmReqgroupDelete"
  class="button-danger"
  on:click={deleteFeature}>
  Delete
</button>
