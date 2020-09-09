<script context="module">
  import { get, post } from "../../../../api";
  export async function preload({ params }, { user }) {
    if (user && user.jwt) {
      const reviews = await get(
        `/projects/${params.id}/baseline`,
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
  import { stores } from "@sapper/app";
  const { page, session } = stores();

  const exportBaseline = async () => {
    await post(
      `/projects/${$page.params.id}/baseline-export`,
      {},
      $session.user && $session.user.jwt
    );
    alert("exporting");
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
    text-align: center;
  }
</style>

<section class="contentWrapper">
  <h2>Requirements Baseline</h2>
  <p class="infoBlurb">
    A requirements baseline is a snapshot in time that represents a reviewed and
    approved set of requirements. A new baseline is automatically created when a
    stakeholder approves a requirement group, file, or userclass.
  </p>
  <button on:click={exportBaseline}>Export requirements baseline</button>
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
  {#if !reviews.length}
    <div class="secondary">No accepted reviews</div>
  {/if}
</section>
