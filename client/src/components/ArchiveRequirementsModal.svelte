<script>
  export let selectedReqs;
  export let close;
  export let update;

  import { patch } from "../api.js";

  const archiveRequirements = async () => {
    await Promise.all(
      selectedReqs.map(id =>
        patch(`/requirements/${id}`, {
          is_archived: true
        })
      )
    );

    await update();
    close();
  };
</script>

<h3>Archive Requirements</h3>
<p>
  This action will remove the selected requirements from the feature and archive
  them.
</p>
<button class="button-caution" on:click={archiveRequirements}>Archive</button>
