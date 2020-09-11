<script>
  export let isDraft = false;
  export let latestReviewStatus;
  export let inline = false;
  export let latestReviewId;

  import { reviewStatusLabels } from "../utils";

  import { stores } from "@sapper/app";
  const { page } = stores();

  import Ribbon from "./Ribbon.svelte";

  $: status = isDraft ? "draft" : latestReviewStatus;
</script>

<style>
  a.hoverable:hover {
    text-decoration: none;
    opacity: 0.8;
  }

  a:not(.hoverable) {
    cursor: none;
    pointer-events: none;
  }
</style>

<a
  href={isDraft ? undefined : `/project/${$page.params.id}/reviews/${latestReviewId}`}
  on:click={isDraft ? () => false : undefined}
  class={`${isDraft ? '' : 'hoverable'}`}>
  <Ribbon
    {inline}
    label={reviewStatusLabels[status].label}
    bgColor={reviewStatusLabels[status].color}
    width={reviewStatusLabels[status].minWidth} />
</a>
