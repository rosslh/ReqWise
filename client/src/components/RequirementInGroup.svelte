<script>
  import FaRegComment from "svelte-icons/fa/FaRegComment.svelte";
  import Requirement from "./Requirement.svelte";
  import ViewRequirementModal from "./ViewRequirementModal.svelte";
  import { modalContent, modalProps } from "../stores.js";
  import { getContext } from "svelte";

  export let requirement;
  export let update;
  export let isPrioritized;
  export let is_draft = true;
  export let is_baseline = false;

  const viewRequirement = (event, id) => {
    modalProps.set({
      id,
      update,
      url: `/project/${requirement.project_id}/requirement/${id}`,
      isPrioritized,
    });
    modalContent.set(ViewRequirementModal);
  };

  const scopes = getContext("scopes");
</script>

<style lang="scss">
  li.requirement > div.iconCell {
    border: none;

    button.commentIconWrapper {
      background-color: var(--background1);
      border: 0.1rem solid var(--borderColor);
      border-radius: 50%;
      height: 3.3rem;
      width: 3.3rem;
      padding: 0.75rem !important;
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
</style>

<Requirement {...$$props}>
  {#if is_draft && !is_baseline && scopes.includes('member')}
    <div class="iconCell">
      <button
        on:click|stopPropagation={(e) => viewRequirement(e, requirement.id)}
        class="commentIconWrapper">
        <FaRegComment />
      </button>
    </div>
  {/if}
</Requirement>
