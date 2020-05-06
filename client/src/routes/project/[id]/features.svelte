<script context="module">
  export async function preload({ params }, { user }) {
    const { id } = params;
    const reqgroups = await get(
      `/projects/${id}/reqgroups?type=feature`,
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
      `/projects/${id}/reqgroups?type=feature`,
      $session.user && $session.user.jwt
    );
  };
</script>

<section class="contentWrapper">
  <h2>Features</h2>
  <p class="infoBlurb">
    A feature is a group of related requirements that allows the user to satisfy
    a high-level objective or need.
    <br />
    Requirements tend to be more granular, and are written with implementation
    in mind.
  </p>
  <AddFeature {update} {id} />
</section>
{#if reqgroups.length}
  <section class="contentWrapper">
    {#each reqgroups as reqgroup (reqgroup.id)}
      <Reqgroup {reqgroup} {update} />
    {/each}
  </section>
{/if}
