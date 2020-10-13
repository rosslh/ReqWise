<script>
  export let prompt;
  export let responses;
  import range from "lodash/range";
  import ResponseEntry from "./ResponseEntry.svelte";

  const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;

  $: values = responses.map((x) => x.numericResponse);
  $: avg = average(values);

  const totalCount = responses.length;

  const numericRange =
    prompt.responseType === "likert"
      ? [
          "Strongly disagree",
          "Somewhat disagree",
          "Neutral / unsure",
          "Somewhat agree",
          "Strongly agree",
        ].map((e, i) => ({ value: i + 1, label: e }))
      : range(prompt.numericFloor, prompt.numericCeiling + 1, 1).map((x) => ({
          value: x,
          label: x,
        }));

  $: results = numericRange
    .map((x) => ({
      ...x,
      count: responses.filter((y) => y.numericResponse === x.value).length,
      respondents: responses
        .filter((y) => y.numericResponse === x.value)
        .map((x) => x.respondentName || "<em>Anonymous</em>"),
      selectedByYou:
        prompt.yourResponse && prompt.yourResponse.numericResponse === x.value,
    }))
    .filter((z) => z.count || numericRange.length <= 6);
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<!-- for small ranges (n<15) rows for numbers with no responses are still shown -->
<!-- for larger ranges, only numbers which received answers are shown-->

{#if responses.length}
  {responses.length}
  {#if responses.length > 1}responses{:else}response{/if}
  received.
  {#if prompt.responseType === 'number'}
    <span class="secondary">
      Average:
      {avg}. Maximum:
      {Math.max(...values)}. Minimum:
      {Math.min(...values)}.
    </span>
  {/if}
{:else}No responses yet{/if}
{#each results as option}
  <ResponseEntry {option} {totalCount} respondents={option.respondents} />
{/each}
