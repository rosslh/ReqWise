<script context="module">
  export async function preload({ params }, { user }) {
    const { id } = params;
    const reqgroups = await get(
      `/projects/${id}/reqgroups?type=quality`,
      user && user.jwt
    );
    return { reqgroups };
  }
</script>

<script>
  import { onMount } from "svelte";
  import { get, post } from "../../../api.js";
  import { stores } from "@sapper/app";

  import Reqgroup from "../../../components/Reqgroup.svelte";
  import AddFeature from "../../../components/AddFeature.svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  export let reqgroups = [];

  const update = async () => {
    reqgroups = await get(
      `/projects/${id}/reqgroups?type=quality`,
      $session.user && $session.user.jwt
    );
  };
</script>

<section class="contentWrapper">
  <h2>Quality Attributes</h2>
  <p class="infoBlurb">
    Quality attributes are measurable or testable properties of a system that
    are used to indicate how well the system satisfies the needs of its
    stakeholders.
  </p>
  <p class="infoBlurb">
    Types of quality attributes include usability, maintainability, efficiency,
    and reliability.
  </p>
  <button>Add quality attribute</button>
</section>
{#if reqgroups.length}
  <section class="contentWrapper">
    {#each reqgroups as reqgroup (reqgroup.id)}
      <Reqgroup {reqgroup} {update} />
    {/each}
  </section>
{/if}
