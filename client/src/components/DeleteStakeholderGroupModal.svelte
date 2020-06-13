<script>
  import { del } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let group;
  export let update;
  export let close;

  $: deleteStakeholderGroup = async () => {
    await del(`/stakeholders/${group.id}`, $session.user && $session.user.jwt);
    await update();
    close();
  };
</script>

<style>

</style>

<h3>Delete Stakeholder Group</h3>
<p>This action cannot be undone.</p>
<button class="button-danger" on:click={deleteStakeholderGroup}>Delete</button>
