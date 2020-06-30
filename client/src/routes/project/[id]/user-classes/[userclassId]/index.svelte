<script>
  import { get } from "../../../../../api.js";
  import { stores } from "@sapper/app";

  import Userclass from "../../../../../components/Userclass.svelte";

  const { page, session } = stores();
  const { userclassId, id } = $page.params;

  let userclass = get(
    `/userclasses/${userclassId}`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    userclass = await get(
      `/userclasses/${userclassId}`,
      $session.user && $session.user.jwt
    );
  };
</script>

<style>
  .userclassPpuid {
    color: var(--secondaryText);
    font-weight: 300;
    margin-left: 1rem;
  }
</style>

<section class="contentWrapper">
  <h2>
    View user class
    {#await userclass}
      <!-- loading -->
    {:then result}
      <span class="userclassPpuid">#{result.ppuid}</span>
    {/await}
  </h2>
  {#await userclass}
    <!-- loading -->
  {:then result}
    <Userclass userclass={result} {update} projectId={id} />
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
</section>
