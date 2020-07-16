<script>
  export let prompt;

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
    <PromptDropdownResponses {prompt} />
  {:else if ['number', 'likert'].includes(prompt.responseType)}
    <PromptNumericResponses {prompt} />
  {:else if ['text', 'paragraph'].includes(prompt.responseType)}
    <PromptTextResponses {prompt} />
  {/if}
</div>
