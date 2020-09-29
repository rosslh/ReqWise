<script>
  import { stores } from "@sapper/app";
  import { format } from "date-fns";

  export let review;
  export let isPreview = false;

  import { post, get } from "../api.js";
  import { reqgroupTypeLabels } from "../utils.js";
  import { modalContent, modalProps } from "../stores.js";

  import StakeholderStatus from "./StakeholderStatus.svelte";
  import Reqgroup from "./Reqgroup.svelte";
  import FilePreview from "./FilePreview.svelte";
  import Comment from "./Comment.svelte";
  import Userclass from "./Userclass.svelte";
  import CommentEditor from "./CommentEditor.svelte";
  import SubmitReviewModal from "./SubmitReviewModal.svelte";
  import MakeDraftModal from "./MakeDraftModal.svelte";
  import ReviewClosed from "./ReviewClosed.svelte";

  import { getContext } from "svelte";

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
    return reqgroupTypeLabels()[type];
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

  const scopes = getContext("scopes");

  $: userIsReviewer =
    $session.user &&
    scopes.includes("stakeholder") &&
    (!review.stakeholders.length ||
      review.stakeholders.includes($session.user.id));

  const withdrawReview = () => {
    modalContent.set(MakeDraftModal);
    modalProps.set({
      entityId: review.reviewedEntity.entityId,
      entityType: review.entityType,
      update,
      context: "withdraw",
    });
  };
</script>

<style>
  .panelHeader {
    display: flex;
    justify-content: space-between;
    background-color: var(--background1);
    margin-bottom: 0;
    border-bottom: 0.1rem solid var(--borderColor);
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

  .preview {
    color: var(--secondaryText);
    background-color: var(--background2);
    margin: 0 -1.5rem -1.25rem; /* keep in sync with .panel in main.css */
    padding: 1.25rem 1.5rem;
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }

  h3 a {
    text-decoration: none;
    color: var(--normalText);
  }

  h3 a:hover {
    text-decoration: underline;
  }

  .previewEntityName {
    font-weight: 400;
    margin-left: 0.75rem;
  }
</style>

<div class="panel">
  <div class="panelHeader">
    <div>
      <h3>
        <a
          rel="prefetch"
          href={`/project/${review.project_id}/reviews/${review.id}`}>
          {#if isPreview}
            Reviewing
            {entityTypeLabel}:
            <span class="previewEntityName">{review.reviewedEntity.name}</span>
          {:else}Reviewing {entityTypeLabel}{/if}
        </a>
      </h3>
      <span class="ppuid">#{ppuid}</span>
    </div>
    <div>
      <StakeholderStatus
        latestReviewStatus={review.status}
        isDraft={false}
        latestReviewId={review.id} />
    </div>
  </div>
  {#if isPreview}
    <div class="preview">
      {format(new Date(review.created_at), 'h:mm a, MMMM d, yyyy')}
      &bull;
      {review.responses.length}
      {review.responses.length === 1 ? 'response' : 'responses'}
    </div>
  {:else}
    <div class="entityWrapper">
      {#if review.entityType === 'reqgroup'}
        <Reqgroup
          baselineSourceId={review.reviewedEntity.entityId}
          reqgroup={review.reviewedEntity}
          hideStakeholderStatus />
      {:else if review.entityType === 'userclass'}
        <Userclass
          baselineSourceId={review.reviewedEntity.entityId}
          hideStakeholderStatus
          userclass={review.reviewedEntity}
          projectId={$page.params.id} />
      {:else if review.entityType === 'file'}
        <FilePreview
          baselineSourceId={review.reviewedEntity.entityId}
          hideStakeholderStatus
          file={review.reviewedEntity}
          projectId={$page.params.id} />
      {/if}
    </div>
    {#if review.status === 'pending' && userIsReviewer}
      <div class="reviewChangesButtonWrapper">
        <button data-cy="reviewChangesButton" on:click={reviewChanges}>Review
          changes</button>
      </div>
    {:else if review.status === 'pending' && scopes.includes('member')}
      <div class="reviewChangesButtonWrapper">
        <button
          data-cy="withdrawReviewButton"
          class="button button-danger"
          on:click={withdrawReview}>
          Withdraw review
        </button>
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
  {/if}
</div>
