<script>
  import { stores } from "@sapper/app";
  import { put } from "../api.js";
  export let entityType;
  export let entityId;
  export let update;
  export let close;

  const { session } = stores();

  import SubmitButton from "./SubmitButton.svelte";

  const submit = async () => {
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
        is_draft: false,
      },
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };
</script>

<h3>Undraft</h3>
<form>
  <SubmitButton id="undraftButton" className="button-caution" handler={submit}>
    Publish item
  </SubmitButton>
</form>
