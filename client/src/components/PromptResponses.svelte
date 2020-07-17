<script>
  export let prompt;
  export let responses;
  export let update;

  import PromptDropdownResponses from "./PromptDropdownResponses.svelte";
  import PromptNumericResponses from "./PromptNumericResponses.svelte";
  import PromptTextResponses from "./PromptTextResponses.svelte";
</script>

<style>
  .responsesWrapper {
    padding: 2rem;
  }
</style>

<div class="responsesWrapper">
  {#if prompt.responseType === 'dropdown'}
    <PromptDropdownResponses {prompt} {responses} />
  {:else if ['number', 'likert'].includes(prompt.responseType)}
    <PromptNumericResponses {prompt} {responses} />
  {:else if ['text', 'paragraph'].includes(prompt.responseType)}
    <PromptTextResponses {prompt} {responses} {update} />
  {/if}
</div>
