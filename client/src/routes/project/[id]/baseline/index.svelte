<script context="module">
  import { get, post } from "../../../../api";
  export async function preload({ params }, { user }) {
    if (user && user.jwt) {
      const reviews = await get(
        `/projects/${params.id}/baseline`,
        user && user.jwt
      );
      const snapshots = await get(
        `/projects/${params.id}/baseline-snapshots`,
        user && user.jwt
      );
      return { reviews, snapshots };
    }
  }
</script>

<script>
  export let reviews;
  export let snapshots;
  import Reqgroup from "../../../../components/Reqgroup.svelte";
  import Userclass from "../../../../components/Userclass.svelte";
  import FilePreview from "../../../../components/FilePreview.svelte";
  import Select from "svelte-select";
  import { stores } from "@sapper/app";
  import { format } from "date-fns";
  const { page, session } = stores();

  const exportBaseline = async () => {
    await post(
      `/projects/${$page.params.id}/baseline-snapshots`,
      {},
      $session.user && $session.user.jwt
    );
    selectedSnapshotOption = undefined;
    snapshots = await get(
      `/projects/${$page.params.id}/baseline-snapshots`,
      $session.user && $session.user.jwt
    );
  };

  $: snapshotOptions = snapshots.map((x) => ({
    label: format(new Date(x.created_at), "yyyy-MM-dd, h:mm a"),
    value: x.fileName,
  }));
  let selectedSnapshotOption;

  const downloadSnapshot = () => {
    window.open(
      `https://storage.googleapis.com/user-file-storage/${selectedSnapshotOption.value}`
    );
    selectedSnapshotOption = undefined;
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
    text-align: center;
  }

  .inputWrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1.5rem;
  }
  .inputWrapper button,
  .inputWrapper fieldset {
    margin: 0 !important;
  }
</style>

<section class="contentWrapper">
  <h2>Requirements Baseline</h2>
  <p class="infoBlurb">
    A requirements baseline is a snapshot in time that represents a reviewed and
    approved set of requirements. A new baseline is automatically created when a
    stakeholder approves a requirement group, file, or userclass.
  </p>
  <div class="inputWrapper">
    <button on:click={exportBaseline}>Create snapshot</button>
    <fieldset class="snapshotWrapper inline">
      <label for="viewSnapshot">Download snapshot</label>
      <div class="selectWrapper">
        <Select
          inputAttributes={{ id: 'viewSnapshot' }}
          isClearable={true}
          isSearchable={false}
          isMulti={false}
          on:select={downloadSnapshot}
          items={snapshotOptions}
          bind:selectedValue={selectedSnapshotOption} />
      </div>
    </fieldset>
  </div>
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
