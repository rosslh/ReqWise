<script>
  export let prompt;
</script>

{#if prompt.responseType === 'number'}
  <input type="number" />
{:else if prompt.responseType === 'text'}
  <input type="text" />
{:else if prompt.responseType === 'paragraph'}
  <textarea />
{:else if prompt.responseType === 'dropdown'}
  <select />
{:else if prompt.responseType === 'likert'}Likert{/if}
