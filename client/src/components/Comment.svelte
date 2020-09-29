<script>
  export let comment;
  export let update;
  import { formatDistanceToNow } from "date-fns";
  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import { stores } from "@sapper/app";
  import { del } from "../api.js";
  import UserScopesFlair from "./UserScopesFlair.svelte";

  const { session } = stores();

  const formatDatetime = (dt) => `${formatDistanceToNow(new Date(dt))} ago`;

  $: deleteComment = async () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      await del(`/comments/${comment.id}`, $session.user && $session.user.jwt);
      await update();
    }
  };
</script>

<style>
  :global(div.commentTextWrapper *) {
    margin: 0.25rem 0 !important;
  }
  div.commentWrapper {
    display: flex;
    border: 0.1rem solid var(--borderColor);
    background-color: var(--background1);
    margin: 0.75rem 0;
    padding: 0.75rem;
    border-radius: 0.5rem;
  }
  div.commentTextWrapper {
    flex-grow: 1;
    margin-left: 1rem;
  }
  div.imageWrapper {
    height: 3rem;
    width: 3rem;
  }

  div.imageWrapper img,
  :global(div.imageWrapper svg) {
    max-height: 100%;
    max-width: 100%;
  }

  .authorName {
    padding-right: 0.5rem;
  }
  .createdAt {
    color: var(--secondaryText);
    font-size: 1.4rem;
    padding-left: 1rem;
  }

  .deleteWrapper {
    display: flex;
    align-items: center;
  }

  .deleteWrapper button {
    margin-top: 0;
  }
</style>

<div class="commentWrapper">
  <div class="imageWrapper squircle">
    {#if comment.authorImageName}
      <img
        src={`https://storage.googleapis.com/user-file-storage/${comment.authorImageName}`}
        alt={comment.authorName} />
    {:else if comment.authorPlaceholderImage}
      {@html comment.authorPlaceholderImage}
    {/if}
  </div>
  <div class="commentTextWrapper">
    <div>
      <span class="authorName">{comment.authorName || 'Slack User'}</span>
      <UserScopesFlair scopes={comment.authorScopes} />
      <time class="createdAt" datetime={comment.created_at}>
        {formatDatetime(comment.created_at)}
      </time>
    </div>
    <div class="commentContent">
      {@html comment.html}
    </div>
  </div>
  <div class="deleteWrapper">
    {#if $session.user && comment.account_id === $session.user.id}
      <button
        on:click={deleteComment}
        class="button button-small button-outline button-clear button-secondary">
        <div class="iconWrapper">
          <FaRegTrashAlt />
        </div>
      </button>
    {/if}
  </div>
</div>
