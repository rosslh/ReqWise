<script>
  export let review;
  import StakeholderStatus from "./StakeholderStatus.svelte";
  import CommentEditor from "./CommentEditor.svelte";

  let quillDelta;
  let plaintextComment = "";

  const postResponse = () => {};
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
</style>

<div class="panel">
  <div class="panelHeader">
    <div>
      <h3>Reviewing</h3>
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
