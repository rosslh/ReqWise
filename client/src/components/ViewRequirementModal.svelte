<script>
  import { onMount, tick } from "svelte";
  import Diff from "text-diff";
  const diff = new Diff();

  import { get, post } from "../api.js";
  import Skeleton from "./Skeleton.svelte";
  import Comment from "./Comment.svelte";
  import CommentEditor from "./CommentEditor.svelte";

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

  onMount(async () => {
    await getRequirement();
    await getComments();
  });

  const getRequirement = async () => {
    const requirement = await get(`/requirements/${id}`);
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

  $: getComments = async () => {
    comments = await get(`/reqversions/${reqversionId}/comments`);
    await tick();
    document
      .getElementById("commentsBottom")
      .scrollIntoView({ behavior: "smooth" });
  };

  $: descriptionDiff =
    newDescription &&
    (() => {
      let difference = diff.main(oldDescription || "", newDescription);
      diff.cleanupSemantic(difference);
      difference = difference.map(part => [part[0], part[1].trim()]); // remove whitespace from end of parts (which have padding)
      return diff.prettyHtml(difference);
    })();

  $: postComment = async () => {
    await post(`/reqversions/${reqversionId}/comments`, {
      plaintext: plaintextComment,
      quillDelta: JSON.stringify(quillDelta),
      type: "comment"
    });
    await getComments();
  };
</script>

<style>
  h4 {
    margin-top: 2rem;
    margin-bottom: 0.6rem;
  }
  :global(.reqversionContent ins) {
    color: var(--green);
  }

  :global(.reqversionContent del) {
    color: var(--red);
  }

  :global(.descDiff > *) {
    padding: 0 0.2rem;
  }

  :global(.descDiff > *:first-child) {
    padding-left: 0;
  }

  :global(.descDiff > *:last-child) {
    padding-right: 0;
  }

  .reqversionContent {
    border: 0.1rem solid var(--grey2);
    background-color: var(--offwhite2);
    border-radius: 0.3rem;
    padding: 0.2rem 0.6rem;
  }

  .capitalize {
    text-transform: capitalize;
  }

  .authorEmail {
    color: var(--grey4);
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
    height: calc(100% - 28rem);
    overflow-y: scroll;
    top: 4rem;
    position: relative;
  }
  .column.comments > .commentsBottom {
    background-color: white;
    height: 24rem;
  }
  .column.comments > h4 {
    position: fixed;
    margin-top: 0.5rem;
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
    <h4>Priority</h4>
    {#if newPriority}
      <div class="reqversionContent">
        {#if typeof oldPriority === 'undefined'}
          <span class="capitalize">{newPriority}</span>
        {:else if oldPriority !== newPriority}
          <span class="capitalize">
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
        <Skeleton rows={4} />
      {/if}
    </div>
    <div class="commentsBottom">
      <CommentEditor bind:quillDelta bind:plaintext={plaintextComment} />
      <button on:click={postComment} class="button-success">
        Post comment
      </button>
    </div>
  </div>
</div>
