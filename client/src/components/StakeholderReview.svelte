<script>
  import { stores } from "@sapper/app";

  export let review;

  import { post, get } from "../api.js";
  import { modalContent, modalProps } from "../stores.js";

  import StakeholderStatus from "./StakeholderStatus.svelte";
  import Reqgroup from "./Reqgroup.svelte";
  import FilePreview from "./FilePreview.svelte";
  import Comment from "./Comment.svelte";
  import Userclass from "./Userclass.svelte";
  import CommentEditor from "./CommentEditor.svelte";
  import SubmitReviewModal from "./SubmitReviewModal.svelte";
  import ReviewClosed from "./ReviewClosed.svelte";

  let quillDelta;
  let plaintextComment = "";

  const { page, session } = stores();

  const update = async () => {
    review = await get(
      `/reviews/${review.id}`,
      $session.user && $session.user.jwt
    );
  };

  const postResponse = async () => {
    await post(
      `/reviews/${review.id}/responses`,
      {
        plaintext: plaintextComment,
        quillDelta: JSON.stringify(quillDelta),
      },
      $session.user && $session.user.jwt
    );
    await update();
  };

  const getReqgroupType = (type) => {
    if (type === "quality") {
      return "quality attribute";
    } else if (type === "business") {
      return "business requirement group";
    } else {
      return type;
    }
  };

  $: entityTypeLabel = (() => {
    const type = review.entityType;
    if (type === "reqgroup") {
      return getReqgroupType(review.reviewedEntity.type);
    } else {
      return type;
    }
  })();

  $: ppuid = review.reviewedEntity.ppuid;

  const reviewChanges = async () => {
    modalContent.set(SubmitReviewModal);
    modalProps.set({ id: review.id, update });
  };
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
    margin-top: 3rem;
  }

  .ppuid {
    color: var(--secondaryText);
    font-weight: 300;
    margin-left: 0.5rem;
  }

  .entityWrapper {
    background-color: var(--background2);
    margin: -1.25rem -1.5rem 1.25rem;
    padding: 1.25rem 1.5rem;
    border-top: 0.1rem solid var(--borderColor);
    border-bottom: 0.1rem solid var(--borderColor);
  }

  .secondary {
    color: var(--secondaryText);
    text-align: center;
    font-size: 1.4rem;
    margin-bottom: 2rem;
  }

  .reviewChangesButtonWrapper {
    display: flex;
    justify-content: flex-end;
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
      <StakeholderStatus
        latestReviewStatus={review.status}
        isDraft={false}
        latestReviewId={review.id} />
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
  {#if review.status === 'pending'}
    <div class="reviewChangesButtonWrapper">
      <button on:click={reviewChanges}>Review changes</button>
    </div>
  {/if}
  <div>
    <h4>Responses</h4>
    {#each review.responses as response}
      <Comment comment={response} {update} />
    {/each}
    {#if !review.responses.length && review.status === 'pending'}
      <div class="secondary">No responses yet</div>
    {/if}
  </div>
  {#if review.status === 'pending'}
    <div>
      <CommentEditor
        id={review.id}
        postComment={postResponse}
        bind:quillDelta
        bind:plaintext={plaintextComment}
        buttonText="Add response" />
    </div>
  {:else}
    <ReviewClosed {review} />
  {/if}
</div>
