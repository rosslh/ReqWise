<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../../api.js";

  const { page, session } = stores();
  const { promptId } = $page.params;

  let requirements = get(
    `/prompts/${promptId}/requirements`,
    $session.user && $session.user.jwt
  );
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<section class="contentWrapper">
  <h2>Requirements linked to brainstorm prompt</h2>
</section>
{#await requirements}
  <!-- loading -->
{:then result}
  <section class="contentWrapper">
    {#if result.length}
      <ul>
        {#each result as req (req.id)}
          <li>
            {#if req.entityType === 'reqgroup'}
              <a
                rel="prefetch"
                href={`/project/${req.project_id}/reqgroup/${req.id}`}>
                #{req.ppuid} {req.name} (requirement group)
              </a>
            {:else}
              <a
                rel="prefetch"
                href={`/project/${req.project_id}/requirement/${req.id}`}>
                #{req.ppuid} {req.description} (requirement)
              </a>
            {/if}
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
