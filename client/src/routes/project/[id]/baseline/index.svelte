<script context="module">
  import { get } from "../../../../api";
  export async function preload({ params }, { user }) {
    if (user && user.jwt) {
      const reviews = await get(
        `/projects/${params.id}/baselines`,
        user && user.jwt
      );
      return { reviews };
    }
  }
</script>

<script>
  export let reviews;
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
  {#each reviews as review}
    {#if review.entityType === 'reqgroup'}
      <Reqgroup
        reqgroup={review.reviewedEntity}
        baselineSourceId={review.entity_reqgroup_id} />
    {:else if review.entityType === 'userclass'}
      <Userclass
        userclass={review.reviewedEntity}
        baselineSourceId={review.entity_userclass_id} />
    {:else}
      <FilePreview
        file={review.reviewedEntity}
        baselineSourceId={review.entity_file_id} />
    {/if}
  {/each}
</section>
