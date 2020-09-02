<script>
  export let isDraft = false;
  export let latestReviewStatus;
  export let inline = false;
  export let latestReviewId;

  import { stores } from "@sapper/app";
  const { page } = stores();

  import Ribbon from "./Ribbon.svelte";

  $: status = isDraft ? "draft" : latestReviewStatus;

  const statuses = {
    draft: {
      bgColor: "var(--secondaryText)",
      label: "Draft",
      width: "3.75rem",
    },
    pending: {
      bgColor: "var(--indigo)",
      label: "Pending",
      width: "5rem",
    },
    accept: {
      bgColor: "var(--green)",
      label: "Accepted",
      width: "6rem",
    },
    requestChanges: {
      bgColor: "var(--red)",
      label: "Changes Requested",
      width: "7rem",
    },
    withdrawn: {
      bgColor: "var(--secondaryText)",
      label: "Withdrawn",
      width: "7rem",
    },
  };
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
    label={statuses[status].label}
    bgColor={statuses[status].bgColor}
    width={statuses[status].width} />
</a>
