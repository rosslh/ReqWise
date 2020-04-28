<script>
  export let comment;
  import { formatRelative } from "date-fns";

  const formatDatetime = dt => formatRelative(new Date(dt), new Date());
</script>

<style>
  :global(div.commentTextWrapper *) {
    margin: 0.3rem 0 !important;
  }
  div.commentWrapper {
    display: flex;
    border: 1px solid var(--grey1);
    margin: 0.5rem 0;
    padding: 0.5rem;
    border-radius: 0.3rem;
  }
  div.commentTextWrapper {
    flex-grow: 1;
    margin-left: 1rem;
  }
  div.imageWrapper {
    width: 3rem;
    margin-top: 1rem;
  }
  div.imgPlaceholder {
    background-color: var(--grey2);
    border-radius: 50%;
    height: 3rem;
    width: 3rem;
  }
  .createdAt {
    color: var(--grey4);
    font-size: 1.4rem;
    margin-left: 1rem;
  }
</style>

<div class="commentWrapper">
  <div class="imageWrapper">
    <div class="imgPlaceholder" />
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
