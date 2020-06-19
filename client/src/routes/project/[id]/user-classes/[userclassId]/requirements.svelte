<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../api.js";

  const { page, session } = stores();
  const { userclassId } = $page.params;

  let requirements = get(
    `/userclasses/${userclassId}/requirements`,
    $session.user && $session.user.jwt
  );
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<section class="contentWrapper">
  <h2>Requirements linked to userclass</h2>
</section>
{#await requirements}
  <!-- loading -->
{:then result}
  <section class="contentWrapper">
    {#if result.length}
      <ul>
        {#each result as req (req.id)}
          <li>
            <a href={`/project/${req.project_id}/requirement/${req.id}`}>
              #{req.ppuid} {req.description}
            </a>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="secondary">No requirements linked</div>
    {/if}
  </section>
{:catch error}
  <section class="contentWrapper">
    <p style="color: var(--red)">{error.message}</p>
  </section>
{/await}
