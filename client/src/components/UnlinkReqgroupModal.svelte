<script>
  import { del } from "../api";
  import { reqgroupTypeLabels } from "../utils";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let unlinkId;
  export let unlinkType;
  export let reqgroupId;
  export let reqgroupType;
  export let update;
  export let close;

  $: unlink = async () => {
    if (unlinkType === "prompt") {
      await del(
        `/prompts/${unlinkId}/reqgroups/${reqgroupId}`,
        $session.user && $session.user.jwt
      );
    }
    await update();
    close();
  };
</script>

<style>
</style>

<h3>Unlink {reqgroupTypeLabels()[reqgroupType]}</h3>
<button class="button-caution" on:click={unlink}>Unlink</button>
