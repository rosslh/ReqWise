<script>
  import { onMount } from "svelte";
  import { stores } from "@sapper/app";
  import { get } from "../api.js";
  import Skeleton from "../components/Skeleton.svelte";
  export let id;
  const { session } = stores();
  let versions = get(
    `/requirements/${id}/versions`,
    $session.user && $session.user.jwt
  );
</script>

{id}
{#await versions}
  <Skeleton rows={2} />
{:then result}
  <pre>{result.length}</pre>
{:catch error}
  <section class="contentWrapper">
    <p style="color: var(--red)">{error.message}</p>
  </section>
{/await}
