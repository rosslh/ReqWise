<script>
  import { onMount } from "svelte";
  import Diff from "text-diff";
  const diff = new Diff();

  import { get } from "../api.js";
  import Skeleton from "./Skeleton.svelte";

  export let id;

  let oldPriority;
  let newPriority;
  let oldDescription;
  let newDescription;
  let rationale;
  let comments;

  onMount(async () => {
    const requirement = await get(`/requirements/${id}`);
    oldPriority = requirement.previousVersion.priority;
    newPriority = requirement.latestVersion.priority;
    oldDescription = requirement.previousVersion.description;
    newDescription = requirement.latestVersion.description;
    rationale = requirement.latestVersion.rationale;
  });
  $: descriptionDiff =
    newDescription &&
    (() => {
      let difference = diff.main(oldDescription || "", newDescription);
      diff.cleanupSemantic(difference);
      difference = difference.map(part => [part[0], part[1].trim()]); // remove whitespace from end of parts (which have padding)
      return diff.prettyHtml(difference);
    })();
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
</style>

<h3>Proposed requirement</h3>
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
<h4>Comments</h4>
