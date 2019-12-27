<script>
  import { onMount } from "svelte";
  import { get } from "../../api.js";

  import { stores } from "@sapper/app";
  const { page } = stores();

  let name = "";
  let description = "";
  let loaded = false;

  onMount(async () => {
    const { id } = $page.params;
    ({ name, description } = await get(`/teams/${id}`));
    loaded = true;
  });
</script>

<h1>ReqWise</h1>

{#if loaded}
  <div>
    <label for="name">Team name</label>
    <input id="name" type="text" bind:value={name} />
  </div>
  <div>
    <label for="description">Description</label>
    <input id="description" type="text" bind:value={description} />
  </div>
{:else}Loading...{/if}
