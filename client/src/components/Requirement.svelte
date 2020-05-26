<script>
  import FaRegComment from "svelte-icons/fa/FaRegComment.svelte";
  import FaGithub from "svelte-icons/fa/FaGithub.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import FaExclamation from "svelte-icons/fa/FaExclamation.svelte";
  import FaRegClock from "svelte-icons/fa/FaRegClock.svelte";
  import FaCheck from "svelte-icons/fa/FaCheck.svelte";
  import FaThumbsUp from "svelte-icons/fa/FaThumbsUp.svelte";
  import FaGripVertical from "svelte-icons/fa/FaGripVertical.svelte";

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
  li.requirement > div.iconCell {
    padding: 0 !important;
    border: none;

    button.commentIconWrapper {
      background-color: var(--background1);
      border: 1px solid var(--borderColor);
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

  li.requirement > div {
    padding: 0.6rem 1.6rem;
    border-bottom: 0.1rem solid var(--borderColor);
    margin: 0;
  }

  li.requirement > div.desc {
    flex-grow: 1;
    padding-left: 0;
  }

  li.requirement > div.ppuid {
    color: var(--secondaryText);
    font-weight: 300;
  }

  li.requirement > div.priority {
    text-transform: capitalize;
  }

  li.requirement > div.status {
    white-space: nowrap !important;
  }

  li.requirement > div.reqHandle {
    visibility: hidden;
    padding-right: 0.3rem;
    padding-left: 0.5rem;
    cursor: grab;
    color: var(--secondaryText);
    border: none;
    &:hover {
      color: var(--regularText);
    }
    &:active {
      cursor: grabbing;
    }
  }

  li.requirement > div.history {
    color: var(--secondaryText);
    text-decoration: underline;
    text-decoration-style: dashed;
  }

  li.requirement:hover {
    .reqHandle {
      visibility: visible;
    }
  }

  li.requirement.selected {
    background-color: var(--backdrop);
  }

  li.requirement.selected:hover {
    background-color: var(--background2);
  }

  :global(div.reqgroup.dragging li.requirement) {
    background: none !important;
  }

  li.requirement {
    margin: 0.2rem 0;
    border-radius: 0.4rem;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
  }

  @for $i from 0 through 10 {
    li.requirement.depth-#{$i} {
      left: 3rem * $i;
    }

    .nestedPlaceholder.depth-#{$i} {
      left: 1rem + 3rem * $i;
    }
  }

  .nestedPlaceholder {
    visibility: hidden;
    height: 2.25rem;
    padding: 0;
    margin: -1rem 0 -1.25rem;
    transition: opacity 0.2s ease, height 0.2s ease;
    border-radius: 0.4rem;
    position: relative;
    box-sizing: content-box;
    background-clip: padding-box;
    &:hover {
      height: 5rem;
      opacity: 1;
      background-color: var(--backdrop);
      border: 1rem solid transparent;
    }
  }

  :global(.draggable-container--over .nestedPlaceholder) {
    visibility: visible !important;
  }

  :global(.draggable-container--over .nestedPlaceholder.hidden) {
    visibility: hidden !important;
  }
</style>

{#if index === 0}
  <li
    class={`nestedPlaceholder draggable depth-0 ${hiddenPlaceholders.includes(-1) ? 'hidden' : ''}`}
    data-parentid={-1}
    data-isplaceholder={1} />
{/if}
<li
  class={`${selected ? 'selected' : ''} requirement draggable depth-${requirement.depth}`}
  on:click={() => toggleReq(requirement.id)}
  data-reqid={requirement.id}>
  <div class="reqHandle">
    <div class="iconWrapper">
      <FaGripVertical />
    </div>
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
</li>
<li
  data-parentid={requirement.id}
  data-isplaceholder={1}
  class={`nestedPlaceholder draggable depth-${requirement.depth + 1} ${hiddenPlaceholders.includes(requirement.id) ? 'hidden' : ''}`} />
