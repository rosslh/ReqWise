<script>
  import { stores } from "@sapper/app";
  import { put } from "../api.js";
  export let entityType;
  export let entityId;
  export let update;
  export let close;
  export let context = "draftify";

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

{#if context === 'withdraw'}
  <h3>Withdraw review</h3>
  <p>Reviewed item will be converted back into a draft.</p>
  <form>
    <SubmitButton className="button-danger" handler={makeDraft}>
      Withdraw
    </SubmitButton>
  </form>
{:else}
  <h3>Convert to draft</h3>
  <p>Pending reviews will be withdrawn.</p>
  <form>
    <SubmitButton className="button-caution" handler={makeDraft}>
      Make draft
    </SubmitButton>
  </form>
{/if}
