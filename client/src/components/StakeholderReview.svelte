<script>
  export let review;
  import StakeholderStatus from "./StakeholderStatus.svelte";
  import CommentEditor from "./CommentEditor.svelte";

  let quillDelta;
  let plaintextComment = "";

  const postResponse = () => {};

  $: entityType = (() => {
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
</style>

<div class="panel">
  <div class="panelHeader">
    <div>
      <h3>
        Reviewing {entityType}
        <span class="ppuid">#{ppuid}</span>
      </h3>
    </div>
    <div>
      <StakeholderStatus latestReviewStatus={review.status} isDraft={false} />
    </div>
  </div>
  <div>proposed requirements...</div>
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
