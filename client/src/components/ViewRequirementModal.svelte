<script>
  import { stores } from "@sapper/app";
  const { session } = stores();

  import { onMount, onDestroy, tick } from "svelte";
  import FaRegFileAlt from "svelte-icons/fa/FaRegFileAlt.svelte";
  import MdFolder from "svelte-icons/md/MdFolder.svelte";
  import FaLevelUpAlt from "svelte-icons/fa/FaLevelUpAlt.svelte";
  import IoMdPeople from "svelte-icons/io/IoMdPeople.svelte";
  import MdHistory from "svelte-icons/md/MdHistory.svelte";

  import { get, post, stream } from "../api.js";
  import Skeleton from "./Skeleton.svelte";
  import Comment from "./Comment.svelte";
  import CommentEditor from "./CommentEditor.svelte";
  import SimpleDiff from "./SimpleDiff.svelte";
  import DescDiff from "./DescDiff.svelte";

  export let isPrioritized; // TODO: fetch this, don't pass as prop
  export let id;
  export let close = () => {};
  export let update = () => {};

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
  let parent_ppuid;
  let reqgroup_ppuid;
  let loaded = false;

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
      parent_ppuid,
      reqgroup_ppuid
    } = requirement);
    loaded = true;
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

  .latestRevisionHeading {
    display: flex;
    align-items: center;
  }

  .attachmentButtons {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .attachmentButtons > *:not(:last-child) {
    margin-right: 0.5rem;
  }
</style>

<div class="requirementContainer">
  <div class="column">
    <h2>
      View requirement
      {#if loaded}
        <span class="reqModalPpuid">#{ppuid}</span>
      {/if}
    </h2>
    {#if loaded}
      <div class="attachmentButtons">
        <a
          class="button button-secondary button-small button-outline"
          on:click={close}
          href={`/project/${project_id}/reqgroup/${reqgroup_id}`}>
          <span class="iconWrapper iconWrapper-padded">
            <MdFolder />
          </span>
          Requirement group #{reqgroup_ppuid}
        </a>
        {#if parent_requirement_id}
          <a
            class="button button-secondary button-small button-outline"
            on:click={close}
            href={`/project/${project_id}/requirement/${parent_requirement_id}`}>
            <span class="iconWrapper iconWrapper-padded iconWrapper-mirrored">
              <FaLevelUpAlt />
            </span>
            Parent Requirement #{parent_ppuid}
          </a>
        {/if}
        <a
          on:click={close}
          class="button button-secondary button-small button-outline"
          href={`/project/${project_id}/requirement/${id}/files`}>
          <span class="iconWrapper iconWrapper-padded">
            <FaRegFileAlt />
          </span>
          Files
        </a>
        <a
          on:click={close}
          class="button button-secondary button-small button-outline"
          href={`/project/${project_id}/requirement/${id}/user-classes`}>
          <span class="iconWrapper">
            <IoMdPeople />
          </span>
          User classes
        </a>
        <a
          on:click={close}
          class="button button-secondary button-small button-outline"
          href={`/project/${project_id}/requirement/${id}/history`}>
          <span class="iconWrapper">
            <MdHistory />
          </span>
          History
        </a>
      </div>
    {:else}
      <Skeleton rows={2} />
    {/if}
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
    {#if !loaded}
      <Skeleton noPadding />
    {:else}
      <DescDiff {oldDescription} {newDescription} />
    {/if}
    {#if isPrioritized}
      <h5>Priority</h5>
      {#if loaded}
        <div class="reqversionContent">
          <SimpleDiff oldText={oldPriority} newText={newPriority} />
        </div>
      {:else}
        <Skeleton noPadding />
      {/if}
    {/if}
    <h5>Reason for change</h5>
    {#if !loaded}
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
    {#if loaded}
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
