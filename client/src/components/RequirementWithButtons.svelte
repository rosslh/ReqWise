<script>
  import FaRegComment from "svelte-icons/fa/FaRegComment.svelte";
  import Requirement from "./Requirement.svelte";
  import ViewRequirementModal from "./ViewRequirementModal.svelte";
  import UnlinkRequirementModal from "./UnlinkRequirementModal.svelte";
  import { modalContent, modalProps } from "../stores.js";
  import { getContext } from "svelte";
  import FaUnlink from "svelte-icons/fa/FaUnlink.svelte";
  import FaLink from "svelte-icons/fa/FaLink.svelte";

  export let requirement;
  export let update;
  export let isPrioritized;
  export let is_draft = true;
  export let is_baseline = false;

  export let unlinkId;
  export let unlinkType;

  const viewRequirement = () => {
    modalProps.set({
      id: requirement.id,
      update,
      url: `/project/${requirement.project_id}/requirement/${requirement.id}`,
      isPrioritized,
    });
    modalContent.set(ViewRequirementModal);
  };

  const scopes = getContext("scopes");

  const unlink = () => {
    modalProps.set({
      requirementId: requirement.id,
      update,
      unlinkId,
      unlinkType,
    });
    modalContent.set(UnlinkRequirementModal);
  };

  const canEdit = is_draft && !is_baseline && scopes.includes("member");
</script>

<style lang="scss">
  li.requirement > div.iconCell {
    border: none;

    .buttonIconWrapper {
      background-color: var(--background1);
      border: 0.1rem solid var(--borderColor);
      border-radius: 50%;
      height: 3.3rem;
      width: 3.3rem;
      color: var(--normalText);
      box-sizing: border-box;
      margin: 0;

      &:hover {
        color: var(--themeColor);
        background-color: var(--background1);
        opacity: 1 !important;
      }
    }
  }

  .buttonIconWrapper.comment {
    padding: 0.75rem !important;
  }
  .buttonIconWrapper.unlink,
  .buttonIconWrapper.link {
    padding: 0.9rem !important;
    margin-right: 0.5rem !important;
  }
</style>

<Requirement {...$$props}>
  {#if unlinkId}
    {#if canEdit}
      <div class="iconCell">
        <button
          on:click|stopPropagation={() => unlink()}
          class="buttonIconWrapper unlink">
          <FaUnlink />
        </button>
      </div>
    {/if}
  {:else}
    <div class="iconCell">
      <a
        href={`/project/${requirement.project_id}/requirement/${requirement.id}/linked`}
        class="buttonIconWrapper button link">
        <FaLink />
      </a>
    </div>
  {/if}
  {#if canEdit}
    <div class="iconCell">
      <button
        data-cy="commentIconWrapper"
        on:click|stopPropagation={() => viewRequirement()}
        class="buttonIconWrapper comment">
        <FaRegComment />
      </button>
    </div>
  {/if}
</Requirement>
