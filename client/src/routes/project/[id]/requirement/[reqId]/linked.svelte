<script>
  import { stores } from "@sapper/app";
  import { get } from "../../../../../api.js";
  import BrainstormPrompt from "../../../../../components/BrainstormPrompt.svelte";
  import Userclass from "../../../../../components/Userclass.svelte";
  import FilePreview from "../../../../../components/FilePreview.svelte";
  import AddPromptToRequirementModal from "../../../../../components/AddPromptToRequirementModal.svelte";
  import AddUserclassToRequirementModal from "../../../../../components/AddUserclassToRequirementModal.svelte";
  import AddFileToRequirementModal from "../../../../../components/AddFileToRequirementModal.svelte";
  import { modalContent, modalProps } from "../../../../../stores.js";

  const { page, session } = stores();
  const { reqId, id } = $page.params;

  let prompts = get(
    `/requirements/${reqId}/prompts`,
    $session.user && $session.user.jwt
  );

  let files = get(
    `/requirements/${reqId}/files`,
    $session.user && $session.user.jwt
  );

  let userclasses = get(
    `/requirements/${reqId}/userclasses`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    prompts = await get(
      `/requirements/${reqId}/prompts`,
      $session.user && $session.user.jwt
    );

    files = get(
      `/requirements/${reqId}/files`,
      $session.user && $session.user.jwt
    );

    userclasses = get(
      `/requirements/${reqId}/userclasses`,
      $session.user && $session.user.jwt
    );
  };

  const addPrompt = () => {
    modalContent.set(AddPromptToRequirementModal);
    modalProps.set({ projectId: id, requirementId: reqId, update });
  };

  const addFile = () => {
    modalContent.set(AddFileToRequirementModal);
    modalProps.set({ projectId: id, requirementId: reqId, update });
  };

  const addUserclass = () => {
    modalContent.set(AddUserclassToRequirementModal);
    modalProps.set({ projectId: id, requirementId: reqId, update });
  };
</script>

<style>
  .secondary {
    color: var(--secondaryText);
  }
</style>

<section class="contentWrapper">
  <h2>Items linked to requirement</h2>
</section>
<section class="contentWrapper">
  <h3>Brainstorm prompts linked to requirement</h3>
  {#await prompts}
    <!-- loading -->
  {:then result}
    {#if result.length}
      {#each result as prompt (prompt.id)}
        <BrainstormPrompt {prompt} {update} unlinkRequirement={reqId} />
      {/each}
    {:else}
      <div class="secondary">No prompts linked</div>
    {/if}
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
  <button class="button button-success" on:click={addPrompt}>Add prompt</button>
</section>
<section class="contentWrapper">
  <h3>Files linked to requirement</h3>
  {#await files}
    <!-- loading -->
  {:then result}
    {#if result.length}
      {#each result as file (file.id)}
        <FilePreview {file} {update} unlinkRequirement={reqId} />
      {/each}
    {:else}
      <div class="secondary">No files linked</div>
    {/if}
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
  <button class="button button-success" on:click={addFile}>Add file</button>
</section>
<section class="contentWrapper">
  <h3>User classes linked to requirement</h3>
  {#await userclasses}
    <!-- loading -->
  {:then result}
    {#if result.length}
      {#each result as userclass (userclass.id)}
        <Userclass
          {userclass}
          {update}
          projectId={id}
          unlinkRequirement={reqId} />
      {/each}
    {:else}
      <div class="secondary">No userclasses linked</div>
    {/if}
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
  <button class="button button-success" on:click={addUserclass}>
    Add userclass
  </button>
</section>
