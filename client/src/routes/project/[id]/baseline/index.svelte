<script context="module">
  import { get } from "../../../../api";
  export async function preload({ params }, { user }) {
    if (user && user.jwt) {
      const baselines = await get(
        `/projects/${params.id}/baselines`,
        user && user.jwt
      );
      return { baselines };
    }
  }
</script>

<script>
  export let baselines;
  import Reqgroup from "../../../../components/Reqgroup.svelte";
  import Userclass from "../../../../components/Userclass.svelte";
  import FilePreview from "../../../../components/FilePreview.svelte";
</script>

<section class="contentWrapper">
  <h2>Requirements Baseline</h2>
  <p class="infoBlurb">
    A requirements baseline is a snapshot in time that represents a reviewed and
    approved set of requirements. A new baseline is automatically created when a
    stakeholder approves a requirement group, file, or userclass.
  </p>
</section>
<section class="contentWrapper">
  {#each baselines as baseline}
    {#if baseline.reqgroup}
      <Reqgroup reqgroup={baseline.reqgroup} />
    {:else if baseline.userclass}
      <Userclass userclass={baseline.userclass} />
    {:else}
      <FilePreview file={baseline.file} />
    {/if}
  {/each}
</section>
