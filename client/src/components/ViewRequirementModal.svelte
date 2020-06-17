<script>
  import { stores } from "@sapper/app";
  const { session } = stores();

  import { onMount, onDestroy, tick } from "svelte";

  import { get, post, stream } from "../api.js";
  import Skeleton from "./Skeleton.svelte";
  import Comment from "./Comment.svelte";
  import CommentEditor from "./CommentEditor.svelte";
  import SimpleDiff from "./SimpleDiff.svelte";
  import DescDiff from "./DescDiff.svelte";

  export let isPrioritized;
  export let id;

  let oldPriority;
  let newPriority;
  let oldDescription;
  let newDescription;
  let rationale;
  let authorName;
  let authorEmail;
  let authorImageName;
  let authorPlaceholderImage;

  let isInitialVersion = false;

  let quillDelta;
  let plaintextComment = "";

  let comments;
  let reqversionId;

  const getRequirement = async () => {
    const requirement = await get(
      `/requirements/${id}`,
      $session.user && $session.user.jwt
    );
    isInitialVersion = !requirement.previousVersion.id;
    oldPriority = requirement.previousVersion.priority;
    newPriority = requirement.latestVersion.priority;
    oldDescription = requirement.previousVersion.description;
    newDescription = requirement.latestVersion.description;
    rationale = requirement.latestVersion.rationale;
    authorName = requirement.latestVersion.authorName;
    authorEmail = requirement.latestVersion.authorEmail;
    authorImageName = requirement.latestVersion.authorImageName;
    authorPlaceholderImage = requirement.latestVersion.authorPlaceholderImage;

    reqversionId = requirement.latestVersion.id;
  };

  const scrollToBottom = async () => {
    await tick();

    document
      .getElementById("commentsBottom")
      .scrollIntoView({ behavior: "smooth" });
  };

  $: getComments = async () => {
    comments = await get(
      `/reqversions/${reqversionId}/comments`,
      $session.user && $session.user.jwt
    );
    scrollToBottom();
  };

  $: postComment = async () => {
    await post(
      `/reqversions/${reqversionId}/comments`,
      {
        plaintext: plaintextComment,
        quillDelta: JSON.stringify(quillDelta),
        type: "comment"
      },
      $session.user && $session.user.jwt
    );
  };

  onMount(async () => {
    await getRequirement();
    await getComments();
    if ($session.user && $session.user.jwt) {
      startStream();
    }
  });

  let closeStream;

  $: startStream = function() {
    if (closeStream) {
      closeStream();
    }
    if (reqversionId) {
      closeStream = stream(
        "getCommentNotifications",
        { reqversionId },
        $session.user.jwt,
        event => {
          const data = JSON.parse(event);
          comments = [...comments, ...data];
          scrollToBottom();
        }
      );
    }
  };

  onDestroy(function() {
    if (closeStream) {
      closeStream();
    }
  });

  $: refreshStream =
    typeof window !== "undefined" &&
    !closeStream &&
    $session.user &&
    $session.user.jwt &&
    startStream();
</script>

<style>
  h4 {
    /* margin-top: 2.5rem; */
    margin-bottom: 0.6rem;
    font-size: 1.6rem;
  }

  .authorEmail {
    color: var(--secondaryText);
    margin-left: 0.3rem;
  }

  .requirementContainer {
    display: flex;
    justify-content: space-between;
    /* min-height: 85vh; */
    max-height: 90vh;
    overflow: hidden;
  }

  .requirementContainer > .column {
    max-width: calc(50% - 1rem);
    flex-grow: 1;
    padding: 0 1rem;
  }

  .requirementContainer > .column.comments {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-height: 90vh;
    position: relative;
  }
  .column.comments > .commentsTop {
    flex-grow: 1;
    overflow-y: scroll;
    position: relative;
  }
  .column.comments > .commentsBottom {
    height: 24rem;
  }
  /* h3 {
    margin: 1rem 0 0.5rem;
  } */

  /* h4 {
    margin-top: 1rem;
  } */

  .authorImageWrapper {
    height: 3.5rem;
    width: 3.5rem;
    border-radius: 0.4rem;
    overflow: hidden;
    margin-right: 0.8rem;
  }

  .authorInfo {
    display: flex;
    align-items: center;
    margin-right: 0.5rem;
  }

  .authorImageWrapper img,
  :global(.authorImageWrapper svg) {
    max-height: 100%;
    max-width: 100%;
  }

  .noRationale {
    font-style: italic;
    color: var(--secondaryText);
  }

  .actionButton {
    margin-top: 0;
  }
</style>

<div class="requirementContainer">
  <div class="column">
    <h3>
      Proposed requirement
      {#if !isInitialVersion}change{/if}
    </h3>
    <h4>Description</h4>
    {#if typeof newDescription === 'undefined'}
      <Skeleton noPadding />
    {:else}
      <DescDiff {oldDescription} {newDescription} />
    {/if}
    {#if isPrioritized}
      <h4>Priority</h4>
      {#if newPriority}
        <div class="reqversionContent">
          <SimpleDiff oldText={oldPriority} newText={newPriority} />
        </div>
      {:else}
        <Skeleton noPadding />
      {/if}
    {/if}
    <h4>Reason for change</h4>
    {#if typeof rationale === 'undefined'}
      <Skeleton noPadding />
    {:else}
      <div class="reqversionContent">
        {#if rationale}
          rationale
        {:else}
          <span class="noRationale">No rationale</span>
        {/if}
      </div>
      <!-- zero-width-space to preserve height if rationale is empty-->
    {/if}
    <h4>Proposer</h4>
    {#if authorName}
      <div class="authorInfo">
        <div class="authorImageWrapper">
          {#if authorImageName}
            <img
              src={`https://storage.googleapis.com/user-file-storage/${authorImageName}`}
              alt={authorName} />
          {:else if authorPlaceholderImage}
            {@html authorPlaceholderImage}
          {/if}
        </div>
        <span class="authorName">{authorName}</span>
        <span class="authorEmail">&lt;{authorEmail}&gt;</span>
      </div>
    {:else}
      <Skeleton noPadding />
    {/if}
    <h4>Actions</h4>
    <button class="actionButton button-success button-small button-outline">
      Accept
    </button>
    <button class="actionButton button-caution button-small button-outline">
      Modify
    </button>
    <button class="actionButton button-danger button-small button-outline">
      Reject
    </button>
  </div>
  <div class="column comments">
    <h4>Comments</h4>
    <div class="commentsTop">
      {#if comments}
        <div id="commentsTop" />
        {#each comments as comment (comment.id)}
          <Comment {comment} />
        {/each}
        <div id="commentsBottom" />
      {:else}
        <Skeleton rows={2} />
      {/if}
    </div>
    <div class="commentsBottom">
      <CommentEditor
        {postComment}
        bind:quillDelta
        bind:plaintext={plaintextComment} />
    </div>
  </div>
</div>
