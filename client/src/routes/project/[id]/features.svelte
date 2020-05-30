<script>
  import { get } from "../../../api.js";
  import { projectShouldUpdate } from "../../../stores.js";
  import { stores } from "@sapper/app";

  import Reqgroup from "../../../components/Reqgroup.svelte";
  import AddFeature from "../../../components/AddFeature.svelte";
  import Spinner from "../../../components/Spinner.svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  export let reqgroups = get(
    `/projects/${id}/reqgroups?type=feature`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    reqgroups = await get(
      `/projects/${id}/reqgroups?type=feature`,
      $session.user && $session.user.jwt
    );
  };

  $: updateFromStream =
    $projectShouldUpdate &&
    (() => {
      update();
      $projectShouldUpdate = false;
    })();
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
{#await reqgroups}
  <section class="contentWrapper">
    <Spinner />
  </section>
{:then result}
  <section class="contentWrapper">
    {#each result as reqgroup (reqgroup.id)}
      <Reqgroup {reqgroup} {update} />
    {/each}
  </section>
{:catch error}
  <section class="contentWrapper">
    <p style="color: red">{error.message}</p>
  </section>
{/await}
