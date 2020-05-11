<script>
  import { stores } from "@sapper/app";
  const { session } = stores();

  import { onMount, onDestroy, tick } from "svelte";
  import Diff from "text-diff";
  const diff = new Diff();

  import { get, post, stream } from "../api.js";
  import Skeleton from "./Skeleton.svelte";
  import Comment from "./Comment.svelte";
  import CommentEditor from "./CommentEditor.svelte";

  export let isPrioritized;
  export let id;

  let oldPriority;
  let newPriority;
  let oldDescription;
  let newDescription;
  let rationale;
  let authorName;
  let authorEmail;

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

  $: descriptionDiff =
    newDescription &&
    (() => {
      let difference = diff.main(oldDescription || "", newDescription);
      diff.cleanupSemantic(difference);
      return diff.prettyHtml(difference);
    })();

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
      // TODO: why do I need this check
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
    margin-top: 2.5rem;
    margin-bottom: 0.6rem;
  }
  :global(.reqversionContent ins) {
    color: var(--green);
    background-color: var(--lightGreen);
  }

  :global(.reqversionContent del) {
    color: var(--red);
    background-color: var(--lightRed);
  }

  :global(.descDiff > *:first-child) {
    padding-left: 0;
  }

  :global(.descDiff > *:last-child) {
    padding-right: 0;
  }

  .reqversionContent {
    border: 0.1rem solid var(--borderColor);
    background-color: var(--background2);
    border-radius: 0.3rem;
    padding: 0.2rem 0.6rem;
  }

  .capitalize {
    text-transform: capitalize;
  }

  span.priorityDiff {
    color: var(--secondaryText);
  }

  .authorEmail {
    color: var(--secondaryText);
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
    background-color: var(--background1);
    height: 24rem;
  }
  h3 {
    margin: 1rem 0 0.5rem;
  }

  h4 {
    margin-top: 1rem;
  }
</style>

<div class="requirementContainer">
  <div class="column">
    <h3>
      Proposed requirement
      {#if !isInitialVersion}change{/if}
    </h3>
    <h4>Description</h4>
    {#if typeof descriptionDiff === 'undefined'}
      <Skeleton noPadding />
    {:else}
      <div class="reqversionContent descDiff">
        {@html descriptionDiff}
      </div>
    {/if}
    {#if isPrioritized}
      <h4>Priority</h4>
      {#if newPriority}
        <div class="reqversionContent">
          {#if typeof oldPriority === 'undefined'}
            <span class="capitalize">{newPriority}</span>
          {:else if oldPriority !== newPriority}
            <span class="capitalize priorityDiff">
              <del>{oldPriority}</del>
              &rarr;
              <ins>{newPriority}</ins>
            </span>
          {:else}
            <span class="capitalize">{newPriority}</span>
            (no change)
          {/if}
        </div>
      {:else}
        <Skeleton noPadding />
      {/if}
    {/if}
    <h4>Reason for change</h4>
    {#if typeof rationale === 'undefined'}
      <Skeleton noPadding />
    {:else}
      <div class="reqversionContent">{rationale || '\u200B'}</div>
      <!-- zero-width-space to preserve height if rationale is empty-->
    {/if}
    <h4>Proposer</h4>
    {#if authorName}
      <div class="reqversionContent">
        {authorName}
        <span class="authorEmail">&lt;{authorEmail}&gt;</span>
      </div>
    {:else}
      <Skeleton noPadding />
    {/if}
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
