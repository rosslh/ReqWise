<script>
  import { del } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let unlinkId;
  export let unlinkType;
  export let requirementId;
  export let update;
  export let close;

  $: unlink = async () => {
    if (unlinkType === "file") {
      await del(
        `/files/${unlinkId}/requirements/${requirementId}`,
        $session.user && $session.user.jwt
      );
    } else if (unlinkType === "userclass") {
      await del(
        `/userclasses/${unlinkId}/requirements/${requirementId}`,
        $session.user && $session.user.jwt
      );
    } else if (unlinkType === "prompt") {
      await del(
        `/prompts/${unlinkId}/requirements/${requirementId}`,
        $session.user && $session.user.jwt
      );
    }
    await update();
    close();
  };
</script>

<style>
</style>

<h3>Unlink requirement</h3>
<button class="button-caution" on:click={unlink}>Unlink</button>
