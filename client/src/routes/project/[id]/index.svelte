<script>
  import { onMount } from "svelte";
  import { stores, goto } from "@sapper/app";
  const { page } = stores();

  onMount(() => goto(`${$page.path}/dashboard`, { replaceState: true }));
</script>
