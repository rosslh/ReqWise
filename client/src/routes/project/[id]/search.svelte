<script context="module">
  export async function preload(page) {
    const { q } = page.query;
    const { id } = page.params;
    return { q, id };
  }
</script>

<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../api";

  export let q;
  export let id;

  const { session } = stores();

  const searchResults = get(
    `/projects/${id}/search?q=${encodeURIComponent(q)}`,
    $session.user && $session.user.jwt
  );
</script>

<svelte:head>
  <title>Search results</title>
</svelte:head>
{#await searchResults}
  <!-- loading -->
{:then result}
  <!-- {#each result as r}{r.id}{/each} -->
  <pre>{JSON.stringify(result, null, 2)}</pre>
{/await}
