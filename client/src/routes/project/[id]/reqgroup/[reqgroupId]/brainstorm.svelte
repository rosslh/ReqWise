<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../api.js";
  import BrainstormPrompt from "../../../../../components/BrainstormPrompt.svelte";
  import AddPromptToReqgroupModal from "../../../../../components/AddPromptToReqgroupModal.svelte";
  import { modalContent, modalProps } from "../../../../../stores.js";

  const { page, session } = stores();
  const { reqgroupId, id } = $page.params;

  let prompts = get(
    `/reqgroups/${reqgroupId}/prompts`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    prompts = await get(
      `/reqgroups/${reqgroupId}/prompts`,
      $session.user && $session.user.jwt
    );
  };

  const addPrompt = () => {
    modalContent.set(AddPromptToReqgroupModal);
    modalProps.set({ projectId: id, reqgroupId, update });
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<section class="contentWrapper">
  <h2>Brainstorm prompts linked to requirement group</h2>
  <button class="button button-success" on:click={addPrompt}>Add prompt</button>
</section>
{#await prompts}
  <!-- loading -->
{:then result}
  <section class="contentWrapper">
    {#if result.length}
      {#each result as prompt (prompt.id)}
        <BrainstormPrompt {prompt} {update} unlinkReqgroup={reqgroupId} />
      {/each}
    {:else}
      <div class="secondary">No prompts linked</div>
    {/if}
  </section>
{:catch error}
  <section class="contentWrapper">
    <p style="color: var(--red)">{error.message}</p>
  </section>
{/await}
