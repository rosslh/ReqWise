<script>
  import { stores, goto } from "@sapper/app";
  const { session } = stores();

  import { onMount, onDestroy } from "svelte";
  import FaEdit from "svelte-icons/fa/FaEdit.svelte";
  import FaTrashAlt from "svelte-icons/fa/FaTrashAlt.svelte";
  import MdFolder from "svelte-icons/md/MdFolder.svelte";
  import MdSubdirectoryArrowLeft from "svelte-icons/md/MdSubdirectoryArrowLeft.svelte";
  import MdHistory from "svelte-icons/md/MdHistory.svelte";
  import FaLink from "svelte-icons/fa/FaLink.svelte";

  import { get, post, del, put, stream } from "../api";
  import { reqgroupTypeLabels } from "../utils";
  import Skeleton from "./Skeleton.svelte";
  import Requirement from "./Requirement.svelte";
  import Comment from "./Comment.svelte";
  import CommentEditor from "./CommentEditor.svelte";
  import SimpleDiff from "./SimpleDiff.svelte";
  import DescDiff from "./DescDiff.svelte";
  import ReqversionStatusHistory from "./ReqversionStatusHistory.svelte";

  export let isPrioritized; // TODO: fetch this, don't pass as prop
  export let id;
  export let close = false;
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

  let requirement = get(
    `/requirements/${id}`,
    $session.user && $session.user.jwt
  );
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
    loaded = false;
    requirement = await get(
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
      reqgroup_ppuid,
    } = requirement);
    loaded = true;
  };

  // const scrollToBottom = async () => {
  //   await tick();

  //   document
  //     .getElementById("commentsBottom")
  //     .scrollIntoView({ behavior: "smooth" });
  // };

  $: getComments = async () => {
    comments = await get(
      `/reqversions/${reqversionId}/comments`,
      $session.user && $session.user.jwt
    );
    // scrollToBottom();
  };

  $: postComment = async () => {
    await post(
      `/reqversions/${reqversionId}/comments`,
      {
        plaintext: plaintextComment,
        quillDelta: JSON.stringify(quillDelta),
        type: "comment",
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

  const getUnique = (list) =>
    Array.from(new Set(list.map((a) => a.id))).map((id) => {
      return list.find((a) => a.id === id);
    });

  $: startStream = function () {
    if (closeStream) {
      closeStream();
    }
    if (reqversionId) {
      closeStream = stream(
        "getCommentNotifications",
        { reqversionId },
        $session.user.jwt,
        (event) => {
          const data = JSON.parse(event);
          comments = getUnique([...comments, ...data]);
          // scrollToBottom();
        }
      );
    }
  };

  onDestroy(function () {
    if (closeStream) {
      closeStream();
    }
  });

  $: {
    if (
      typeof window !== "undefined" &&
      !closeStream &&
      $session.user &&
      $session.user.jwt
    ) {
      startStream();
    }
  }
  const acceptProposal = async () => {
    const data = {
      status: "accepted",
    };
    await put(
      `/reqversions/${reqversionId}`,
      data,
      $session.user && $session.user.jwt
    );
    await update();
    if (close) {
      close();
    } else {
      await getRequirement();
      await getComments();
    }
  };

  const rejectProposal = async () => {
    await del(
      `/reqversions/${reqversionId}`,
      $session.user && $session.user.jwt
    );
    await update();
    if (close) {
      close();
    } else {
      await getRequirement();
      await getComments();
    }
  };

  const deleteRequirement = async () => {
    if (
      confirm(
        "Are you sure you want to delete this requirement? This action cannot be undone."
      )
    ) {
      await del(`/requirements/${id}`, $session.user && $session.user.jwt);
      if (close) {
        close();
      } else {
        goto(`/project/${project_id}`);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
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
    padding: 0.5rem;
    border-radius: 0.5rem;
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

  .rotate90 {
    display: inline-block;
    transform: rotate(90deg) translateX(-0.4rem);
  }

  ul.panel {
    width: 100%;
    overflow-x: auto;
    list-style-type: none;
    min-height: 3rem;
    position: relative;
  }

  .latestRevisionPanel {
    padding-top: 0.5rem;
    padding-bottom: 1.6rem;
  }

  .twoCol {
    display: flex;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .twoCol > * {
    flex: 1 1 0;
    min-width: 30rem;
    padding: 0 1rem 1rem;
    margin: 1rem;
    background-color: var(--background2);
    border-radius: 0.5rem;
    border: 0.1rem solid var(--borderColor);
  }
</style>

<div class="requirementContainer">
  <div class="column">
    <h2>
      View requirement {#if loaded}<span class="reqModalPpuid">#{ppuid}</span>{/if}
    </h2>
    {#await requirement}
      <!-- loading -->
    {:then result}
      <ul class="panel">
        <Requirement
          {close}
          isContextModal={true}
          requirement={{ ...result.latestVersion, ...result }} />
      </ul>
    {/await}
    {#if loaded}
      <div class="attachmentButtons">
        {#if newStatus !== 'proposed' && newStatus !== 'modified'}
          <a
            rel="prefetch"
            on:click={close}
            href={`/project/${project_id}/requirement/${id}/edit`}
            class="button button-caution button-small">
            <span class="iconWrapper">
              <FaEdit />
            </span> Edit
          </a>
          <button
            on:click={deleteRequirement}
            class="button-danger button-small">
            <span class="iconWrapper iconWrapper-padded">
              <FaTrashAlt />
            </span> Delete
          </button>
        {/if}
        <a
          rel="prefetch"
          class="button button-secondary button-small button-outline"
          on:click={close}
          href={`/project/${project_id}/reqgroup/${reqgroup_id}`}>
          <span class="iconWrapper iconWrapper-padded">
            <MdFolder />
          </span>
          {reqgroupTypeLabels()[requirement.reqgroupType]} #{reqgroup_ppuid}
        </a>
        {#if parent_requirement_id}
          <a
            rel="prefetch"
            class="button button-secondary button-small button-outline"
            on:click={close}
            href={`/project/${project_id}/requirement/${parent_requirement_id}`}>
            <span class="iconWrapper">
              <span class="rotate90">
                <MdSubdirectoryArrowLeft />
              </span>
            </span> Parent Requirement #{parent_ppuid}
          </a>
        {/if}
        <a
          rel="prefetch"
          on:click={close}
          class="button button-secondary button-small button-outline"
          href={`/project/${project_id}/requirement/${id}/linked`}>
          <span class="iconWrapper iconWrapper-padded">
            <FaLink />
          </span> Linked
        </a>
        <a
          rel="prefetch"
          on:click={close}
          class="button button-secondary button-small button-outline"
          href={`/project/${project_id}/requirement/${id}/history`}>
          <span class="iconWrapper">
            <MdHistory />
          </span> History
        </a>
      </div>
    {:else}
      <Skeleton />
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
    <div class="panel latestRevisionPanel">
      <div class="twoCol">
        <div>
          <h5>Description</h5>
          {#if !loaded}
            <Skeleton noPadding />
          {:else}
            <DescDiff {oldDescription} {newDescription} />
          {/if}
        </div>
        <div>
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
        </div>
      </div>
      <div class="twoCol">
        <div>
          <h5>Proposer</h5>
          {#if loaded}
            <div class="authorInfo">
              <div class="authorImageWrapper squircle">
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
        </div>
        <div>
          <h5>Reason for change</h5>
          {#if !loaded}
            <Skeleton noPadding />
          {:else}
            <div class="reqversionContent">
              {#if rationale}
                {rationale}
              {:else}<span class="noRationale">No rationale</span>{/if}
            </div>
            <!-- zero-width-space to preserve height if rationale is empty-->
          {/if}
        </div>
      </div>
      {#if newStatus === 'proposed' || newStatus === 'modified'}
        <h5>Actions</h5>
        <button
          on:click={acceptProposal}
          class="actionButton button-success button-small button-outline">
          Accept
        </button>
        <button
          on:click={() => {
            oldStatus ? rejectProposal() : deleteRequirement();
          }}
          class="actionButton button-danger button-small button-outline">
          Reject
        </button>
      {/if}
    </div>
    {#if reqversionId}
      <ReqversionStatusHistory id={reqversionId} />
    {:else}
      <h5>Activity</h5>
      <Skeleton />
    {/if}
  </div>
  <div class="column comments">
    <h5>Comments</h5>
    <div class="commentsTop">
      {#if comments}
        <div id="commentsTop" />
        {#each comments as comment (comment.id)}
          <Comment {comment} update={getComments} />
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
