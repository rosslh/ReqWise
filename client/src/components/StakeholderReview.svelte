<script>
  import { stores } from "@sapper/app";

  export let review;
  import StakeholderStatus from "./StakeholderStatus.svelte";
  import Reqgroup from "./Reqgroup.svelte";
  import FilePreview from "./FilePreview.svelte";
  import Userclass from "./Userclass.svelte";

  import CommentEditor from "./CommentEditor.svelte";

  let quillDelta;
  let plaintextComment = "";

  const { page } = stores();

  const postResponse = () => {};

  $: entityTypeLabel = (() => {
    const type = review.entityType;
    if (type === "reqgroup") {
      return review.reviewedEntity.type;
    } else {
      return type;
    }
  })();
  $: ppuid = review.reviewedEntity.ppuid; //review[entityType].ppuid;
</script>

<style>
  .panelHeader {
    display: flex;
    justify-content: space-between;
    background-color: var(--background1);
  }

  .panelHeader h3 {
    font-size: 1.8rem;
    display: inline;
    margin: 0;
  }

  .panel h4 {
    font-size: 1.6rem;
  }

  .ppuid {
    color: var(--secondaryText);
    font-weight: 300;
  }

  .entityWrapper {
    background-color: var(--background2);
    margin: -1.25rem -1.5rem 1.25rem;
    padding: 1.25rem 1.5rem;
    border-top: 0.1rem solid var(--borderColor);
    border-bottom: 0.1rem solid var(--borderColor);
  }
</style>

<div class="panel">
  <div class="panelHeader">
    <div>
      <h3>
        Reviewing {entityTypeLabel}
        <span class="ppuid">#{ppuid}</span>
      </h3>
    </div>
    <div>
      <StakeholderStatus latestReviewStatus={review.status} isDraft={false} />
    </div>
  </div>
  <div class="entityWrapper">
    {#if review.entityType === 'reqgroup'}
      <Reqgroup reqgroup={review.reviewedEntity} hideStakeholderStatus />
    {:else if review.entityType === 'userclass'}
      <Userclass
        hideStakeholderStatus
        userclass={review.reviewedEntity}
        projectId={$page.params.id} />
    {:else if review.entityType === 'file'}
      <FilePreview
        hideStakeholderStatus
        file={review.reviewedEntity}
        projectId={$page.params.id} />
    {/if}
  </div>
  <div>
    <button>Approve</button>
    <button class="button-danger button-outline">Request changes</button>
  </div>
  <div>
    <h4>Responses</h4>
    {#each review.responses as response}
      <pre>{JSON.stringify(response, null, 2)}</pre>
    {/each}
  </div>
  <div>
    <CommentEditor
      id={review.id}
      {postResponse}
      bind:quillDelta
      bind:plaintext={plaintextComment} />
  </div>
</div>
