<script>
  export let comment;
  import { formatDistanceToNow } from "date-fns";

  const formatDatetime = dt => `${formatDistanceToNow(new Date(dt))} ago`;
</script>

<style>
  :global(div.commentTextWrapper *) {
    margin: 0.3rem 0 !important;
  }
  div.commentWrapper {
    display: flex;
    box-shadow: var(--borderColor);
    background-color: var(--background1);
    margin: 0.5rem 0;
    padding: 0.5rem;
    border-radius: 0.3rem;
  }
  div.commentTextWrapper {
    flex-grow: 1;
    margin-left: 1rem;
  }
  div.imageWrapper {
    height: 3rem;
    width: 3rem;
    border-radius: 0.8rem;
    overflow: hidden;
  }

  div.imageWrapper img,
  :global(div.imageWrapper svg) {
    max-height: 100%;
    max-width: 100%;
  }
  .createdAt {
    color: var(--secondaryText);
    font-size: 1.4rem;
    margin-left: 1rem;
  }
</style>

<div class="commentWrapper">
  <div class="imageWrapper">
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
      {comment.authorName}
      <time class="createdAt" datetime={comment.created_at}>
        {formatDatetime(comment.created_at)}
      </time>
    </div>
    <div>
      {@html comment.html}
    </div>
  </div>
</div>
