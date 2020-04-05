<script>
  import Select from "svelte-select";
  import { del } from "../api.js";

  export let featureId;
  export let update;
  export let close;

  $: deleteFeature = async e => {
    await del(`/features/${featureId}`);
    await update();
    close();
  };
</script>

<style>

</style>

<h3>Delete Feature</h3>
<p>The feature's requirements will be archived.</p>
<button class="button-danger" on:click={deleteFeature}>Delete</button>
