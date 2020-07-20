<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../api.js";
  import BrainstormPrompt from "../../../../../components/BrainstormPrompt.svelte";
  import AddPromptToRequirementModal from "../../../../../components/AddPromptToRequirementModal.svelte";
  import { modalContent, modalProps } from "../../../../../stores.js";

  const { page, session } = stores();
  const { reqId, id } = $page.params;

  let prompts = get(
    `/requirements/${reqId}/prompts`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    prompts = await get(
      `/requirements/${reqId}/prompts`,
      $session.user && $session.user.jwt
    );
  };

  const addPrompt = () => {
    modalContent.set(AddPromptToRequirementModal);
    modalProps.set({ projectId: id, requirementId: reqId, update });
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<section class="contentWrapper">
  <h2>Brainstorm prompts linked to requirement</h2>
  <button class="button button-success" on:click={addPrompt}>Add prompt</button>
</section>
{#await prompts}
  <!-- loading -->
{:then result}
  <section class="contentWrapper">
    {#if result.length}
      {#each result as prompt (prompt.id)}
        <BrainstormPrompt {prompt} {update} unlinkRequirement={reqId} />
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
