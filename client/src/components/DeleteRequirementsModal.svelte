<script>
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let selectedReqs;
  export let close;
  export let update;

  import { del } from "../api.js";

  const deleteRequirements = async () => {
    await Promise.all(
      selectedReqs.map(id =>
        del(`/requirements/${id}`, $session.user && $session.user.jwt)
      )
    );

    await update();
    close();
  };
</script>

<h3>Delete Requirements</h3>
<p>
  This action will permanently delete the selected requirements. If you are
  unsure you want to do that, you may want to archive the requirements instead.
</p>
<button
  id="confirmReqDeleteButton"
  class="button-danger"
  on:click={deleteRequirements}>
  Delete
</button>
