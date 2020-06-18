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

  export let isPrioritized; // TODO: fetch this, don't pass as prop
  export let id;
  export let close = () => {};

  let oldStatus;
  let newStatus;
  let oldPriority;
  let newPriority;
  let oldDescription;
  let newDescription;
  let rationale;
  let authorName;
  let authorEmail;
  let authorImageName;
  let authorPlaceholderImage;

  let quillDelta;
  let plaintextComment = "";

  let comments;
  let reqversionId;
  let ppuid;
  let project_id;
  let reqgroup_id;
  let parent_requirement_id;
  let reqgroupName;
  let parent_ppuid;
  let reqgroup_ppuid;

  const getRequirement = async () => {
    const requirement = await get(
      `/requirements/${id}`,
      $session.user && $session.user.jwt
    );
    oldStatus = requirement.previousVersion.status;
    newStatus = requirement.latestVersion.status;
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
    ({
      project_id,
      reqgroup_id,
      parent_requirement_id,
      ppuid,
      reqgroupName,
      parent_ppuid,
      reqgroup_ppuid
    } = requirement);
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

  const getUnique = list =>
    Array.from(new Set(list.map(a => a.id))).map(id => {
      return list.find(a => a.id === id);
    });

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
          comments = getUnique([...comments, ...data]);
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

  const acceptProposal = async () => {
    const data = {
      status: "accepted",
      rationale: "Proposed change accepted"
    };
    await post(
      `/requirements/${id}/versions`,
      data,
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };

  const rejectProposal = async () => {
    const data = {
      status: oldStatus,
      priority: oldPriority,
      description: oldDescription,
      rationale: "Proposed change rejected"
    };
    await post(
      `/requirements/${id}/versions`,
      data,
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };

  const getStatusColor = status => {
    switch (status) {
      case "implemented":
        return "green";
      case "modified":
        return "orange";
      case "proposed":
        return "red";
      default:
        return "indigo";
    }
  };
</script>

<style>
  /* h5 {
    margin-bottom: 0.6rem;
    font-size: 1.6rem;
  } */

  .authorEmail {
    color: var(--secondaryText);
    margin-left: 0.3rem;
  }

  .requirementContainer {
    display: flex;
    justify-content: space-between;
    /* min-height: 85vh; */
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

  /* h5 {
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
    margin-right: 1rem;
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

  .reqModalPpuid {
    font-weight: 300;
    margin-left: 0.5rem;
    color: var(--secondaryText);
  }
  .revisionStatus {
    padding: 0.4rem;
    border-radius: 0.4rem;
    color: #fff;
    font-size: 1.3rem;
    font-weight: 500;
    margin-left: 1.5rem;
    line-height: initial !important;
  }

  .viewReq2col {
    display: flex;
    flex-wrap: wrap;
  }
  .viewReq2col > * {
    min-width: 20rem;
  }
  .viewReq2col > *:first-child {
    margin-right: 0.5rem;
  }

  .latestRevisionHeading {
    display: flex;
    align-items: center;
  }
</style>

<div class="requirementContainer">
  <div class="column">
    <h3>
      Requirement
      {#if ppuid}
        <span class="reqModalPpuid">#{ppuid}</span>
      {/if}
    </h3>
    <h4>Details</h4>
    <div class="viewReq2col">
      <div>
        <h5>Requirement group</h5>
        <div>
          {#if reqgroup_ppuid}
            <a
              on:click={close}
              href={`/project/${project_id}/reqgroup/${reqgroup_id}`}>
              {reqgroupName} #{reqgroup_ppuid}
            </a>
          {:else}
            <Skeleton noPadding />
          {/if}
        </div>
      </div>
      {#if parent_requirement_id}
        <div>
          <h5>Parent requirement</h5>
          <div>
            <a
              on:click={close}
              href={`/project/${project_id}/requirement/${parent_requirement_id}`}>
              #{parent_ppuid}
            </a>
          </div>
        </div>
      {/if}
    </div>
    <h4 class="latestRevisionHeading">
      <div>Latest revision</div>
      {#if newStatus}
        <div
          class="revisionStatus"
          style={`background-color: var(--${getStatusColor(newStatus)})`}>
          {newStatus}
        </div>
      {/if}
    </h4>
    <h5>Description</h5>
    {#if typeof newDescription === 'undefined'}
      <Skeleton noPadding />
    {:else}
      <DescDiff {oldDescription} {newDescription} />
    {/if}
    {#if isPrioritized}
      <h5>Priority</h5>
      {#if newPriority}
        <div class="reqversionContent">
          <SimpleDiff oldText={oldPriority} newText={newPriority} />
        </div>
      {:else}
        <Skeleton noPadding />
      {/if}
    {/if}
    <h5>Reason for change</h5>
    {#if typeof rationale === 'undefined'}
      <Skeleton noPadding />
    {:else}
      <div class="reqversionContent">
        {#if rationale}
          {rationale}
        {:else}
          <span class="noRationale">No rationale</span>
        {/if}
      </div>
      <!-- zero-width-space to preserve height if rationale is empty-->
    {/if}
    <h5>Proposer</h5>
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
    <h5>Actions</h5>
    {#if newStatus !== 'accepted'}
      <button
        on:click={acceptProposal}
        class="actionButton button-success button-small button-outline">
        Accept
      </button>
      <button
        on:click={rejectProposal}
        class="actionButton button-danger button-small button-outline">
        Reject
      </button>
    {:else}
      <a
        on:click={close}
        href={`/project/${project_id}/requirement/${id}/edit`}
        class="button actionButton button-caution button-small button-outline">
        Edit requirement
      </a>
    {/if}
  </div>
  <div class="column comments">
    <h5>Comments</h5>
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
