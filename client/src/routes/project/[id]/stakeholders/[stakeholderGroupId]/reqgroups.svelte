<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../api.js";

  const { page, session } = stores();
  const { stakeholderGroupId } = $page.params;

  let reqgroups = get(
    `/stakeholders/${stakeholderGroupId}/reqgroups`,
    $session.user && $session.user.jwt
  );
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<section class="contentWrapper">
  <h2>Requirement groups linked to stakeholders</h2>
</section>
{#await reqgroups}
  <!-- loading -->
{:then result}
  <section class="contentWrapper">
    {#if result.length}
      <ul>
        {#each result as reqgroup (reqgroup.id)}
          <li>
            <a href={`/project/${reqgroup.project_id}/reqgroup/${reqgroup.id}`}>
              #{reqgroup.ppuid} {reqgroup.name}
            </a>
          </li>
        {/each}
      </ul>
    {:else}
      <div class="secondary">No requirement groups linked</div>
    {/if}
  </section>
{:catch error}
  <section class="contentWrapper">
    <p style="color: var(--red)">{error.message}</p>
  </section>
{/await}
