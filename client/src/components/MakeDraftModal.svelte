<script>
  import { stores } from "@sapper/app";
  import { put } from "../api.js";
  export let entityType;
  export let entityId;
  export let update;
  export let close;

  const { session } = stores();

  import SubmitButton from "./SubmitButton.svelte";

  const makeDraft = async () => {
    let endpoint;
    if (entityType === "reqgroup") {
      endpoint = `/reqgroups/${entityId}`;
    } else if (entityType === "file") {
      endpoint = `/files/${entityId}`;
    } else {
      endpoint = `/userclasses/${entityId}`;
    }
    await put(
      endpoint,
      {
        is_draft: true,
      },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };
</script>

<h3>Convert to draft</h3>
<p>Pending reviews will be withdrawn.</p>
<form>
  <SubmitButton handler={makeDraft}>Make draft</SubmitButton>
</form>
