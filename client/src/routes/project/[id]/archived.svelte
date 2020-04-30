<script>
  import { onMount } from "svelte";
  import { get } from "../../../api.js";
  import { stores } from "@sapper/app";

  const { page } = stores();
  const { id } = $page.params;

  let requirements = [];

  const update = async () => {
    get(`/projects/${id}/archived`).then(r => {
      ({ requirements } = r);
    });
  };

  onMount(update);
</script>

<section class="contentWrapper">{JSON.stringify(requirements)}</section>
