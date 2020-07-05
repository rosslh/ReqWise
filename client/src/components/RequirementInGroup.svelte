<script>
  import FaRegComment from "svelte-icons/fa/FaRegComment.svelte";
  import Requirement from "./Requirement.svelte";
  import ViewRequirementModal from "./ViewRequirementModal.svelte";
  import { modalContent, modalProps } from "../stores.js";

  export let requirement;
  export let update;
  export let isPrioritized;

  const viewRequirement = (event, id) => {
    modalProps.set({
      id,
      update,
      url: `/project/${requirement.project_id}/requirement/${id}`,
      isPrioritized
    });
    modalContent.set(ViewRequirementModal);
  };
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
      padding: 0.8rem !important;
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

<Requirement {...$$props} isInteractive={true}>
  <div class="iconCell">
    <button
      on:click|stopPropagation={e => viewRequirement(e, requirement.id)}
      class="commentIconWrapper">
      <FaRegComment />
    </button>
  </div>
</Requirement>
