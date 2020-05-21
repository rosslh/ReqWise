<script>
  import FaRegComment from "svelte-icons/fa/FaRegComment.svelte";
  import FaGithub from "svelte-icons/fa/FaGithub.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import FaExclamation from "svelte-icons/fa/FaExclamation.svelte";
  import FaRegClock from "svelte-icons/fa/FaRegClock.svelte";
  import FaCheck from "svelte-icons/fa/FaCheck.svelte";
  import FaThumbsUp from "svelte-icons/fa/FaThumbsUp.svelte";

  import { modalContent, modalProps } from "../stores.js";
  import ViewRequirementModal from "./ViewRequirementModal.svelte";
  import UpdateRequirementModal from "./UpdateRequirementModal.svelte";

  export let requirement;
  export let toggleReq;
  export let selected;
  export let update;
  export let isPrioritized;
  export let hiddenPlaceholders;
  export let index;

  const getStatusColor = status => {
    switch (status) {
      case "proposed":
        return "red";
      case "accepted":
        return "indigo";
      case "inProgress":
        return "orange";
      default:
        return "green";
    }
  };

  const getPriorityColor = status => {
    switch (status) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      default:
        return "green";
    }
  };

  const viewRequirement = (event, id) => {
    event.stopPropagation();
    modalContent.set(ViewRequirementModal);
    modalProps.set({ id, update, url: `/requirements/${id}`, isPrioritized });
  };

  const proposeChange = (event, id) => {
    event.stopPropagation();
    modalContent.set(UpdateRequirementModal);
    modalProps.set({ id, update, url: `/requirements/${id}`, isPrioritized });
  };
</script>

<style lang="scss">
  div.requirement > div.iconCell {
    position: absolute;
    right: 5rem;
    padding: 0 !important;
    border: none;
    width: 0;

    button.commentIconWrapper {
      background-color: var(--background1);
      border: 1px solid var(--borderColor);
      border-radius: 50%;
      height: 3.3rem;
      width: 3.3rem;
      padding: 0.8rem !important;
      color: var(--normalText);
      box-sizing: border-box;
      transform: translateY(0.5rem);
      margin: 0;

      &:hover {
        color: var(--themeColor);
        background-color: var(--background1);
        opacity: 1 !important;
      }
    }
  }

  li {
    display: block;
    height: 4rem;
    display: flex;
    align-items: center;
    > * {
      flex-grow: 1;
    }
  }

  div.requirement > div {
    display: inline-block;
    padding: 0.6rem 1.2rem;
  }

  div.requirement > div.ppuid {
    color: var(--secondaryText);
  }

  div.requirement > div.priority {
    text-transform: capitalize;
  }

  div.requirement > div.status {
    white-space: nowrap !important;
  }

  div.requirement > div.controls span.reqHandle {
    cursor: grab;
    color: var(--secondaryText);
    padding: 0.8rem;
    &:hover {
      color: var(--regularText);
    }
    &:active {
      cursor: grabbing;
    }
  }

  div.requirement > div.history {
    color: var(--secondaryText);
    text-decoration: underline;
    text-decoration-style: dashed;
  }

  div.requirement > div:first-child {
    padding-left: 1rem;
  }

  div.requirement > div:nth-last-child(2) {
    padding-right: 5rem;
  }

  div.requirement:hover {
    background-color: var(--background2);
  }

  div.requirement.selected {
    background-color: var(--backdrop);
  }

  div.requirement.selected:hover {
    background-color: var(--background2);
  }

  div.requirement {
    position: relative;
    border-radius: 0.4rem;
    overflow: hidden;
    cursor: pointer;
  }

  div.requirement.depth-1 {
    left: 3rem;
    div.iconCell {
      transform: translateX(-3rem);
    }
  }

  div.requirement.depth-2 {
    left: 6rem;
    div.iconCell {
      transform: translateX(-6rem);
    }
  }

  .nestedPlaceholder {
    height: 5rem;
    background-color: var(--background2);
    border: 2px dashed var(--secondaryText);
    display: none;
    border-radius: 0.4rem;

    &:hover {
      background-color: var(--backdrop);
    }

    &.depth-1 {
      margin-left: 3rem;
    }

    &.depth-2 {
      margin-left: 6rem;
    }

    &.depth-3 {
      margin-left: 9rem;
    }
  }

  :global(.draggable-container--over .nestedPlaceholder) {
    display: block !important;
  }

  :global(.draggable-container--over .nestedPlaceholder.hidden) {
    display: none !important;
  }
</style>

{#if index === 0}
  <li
    data-parentid={-1}
    data-isplaceholder={1}
    class={`draggable nestedPlaceholder depth-0 ${hiddenPlaceholders.includes(-1) ? 'hidden' : ''}`} />
{/if}
<li class="requirementContainer">
  <div
    class={`${selected ? 'selected' : ''} requirement draggable depth-${requirement.depth}`}
    on:click={() => toggleReq(requirement.id)}
    data-reqid={requirement.id}>
    <div class="controls">
      <span class="reqHandle">&#10303;</span>
    </div>
    <div class="desc">{requirement.description}</div>
    <div class="ppuid">#{requirement.ppuid}</div>
    <div class="status">
      {#if requirement.status === 'proposed'}
        <span
          class="iconWrapper"
          style={`color:var(--${getStatusColor(requirement.status)})`}>
          <FaExclamation />
        </span>
        <span>Proposed</span>
      {:else}
        <span
          class="iconWrapper"
          style={`color:var(--${getStatusColor(requirement.status)})`}>
          <FaThumbsUp />
        </span>
        Accepted
        <!-- {:else if requirement.status === 'inProgress'}
      <span
        class="iconWrapper"
        style={`color:var(--${getStatusColor(requirement.status)})`}>
        <FaRegClock />
      </span>
      In Progress
    {:else}
      <span
        class="iconWrapper"
        style={`color:var(--${getStatusColor(requirement.status)})`}>
        <FaCheck />
      </span>
      Implemented -->
      {/if}
    </div>
    {#if isPrioritized}
      <div
        class="priority"
        style={`color:var(--${getPriorityColor(requirement.priority)})`}>
        {requirement.priority}
      </div>
    {/if}
    <div class="history">X at Y</div>
    <div class="iconCell">
      <button
        on:click={e => {
          requirement.status === 'proposed' ? viewRequirement(e, requirement.id) : proposeChange(e, requirement.id);
        }}
        class="commentIconWrapper">
        {#if requirement.status === 'proposed'}
          <FaRegComment />
        {:else}
          <FaRegEdit />
        {/if}
      </button>
    </div>
  </div>
</li>
<li
  data-parentid={requirement.id}
  data-isplaceholder={1}
  class={`draggable nestedPlaceholder depth-${requirement.depth + 1} ${hiddenPlaceholders.includes(requirement.id) ? 'hidden' : ''}`} />
