<script>
  export let prompt;

  const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;

  $: values = prompt.responses.map(x => x.numericResponse);
  $: avg = average(values);
</script>

{#if prompt.responses.length}
  {prompt.responses.length}
  {#if prompt.responses.length > 1}responses{:else}response{/if}
  received. Average: {avg}. Maximum: {Math.max(values)}. Minimum: {Math.min(values)}.
{:else}No responses yet{/if}
