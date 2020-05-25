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
  tr.requirement > td.iconCell {
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

  tr.requirement > td {
    padding: 0.6rem 1.2rem;
  }

  tr.requirement > td.ppuid {
    color: var(--secondaryText);
  }

  tr.requirement > td.priority {
    text-transform: capitalize;
  }

  tr.requirement > td.status {
    white-space: nowrap !important;
  }

  tr.requirement > td.reqHandle {
    cursor: grab;
    color: var(--secondaryText);
    &:hover {
      color: var(--regularText);
    }
    &:active {
      cursor: grabbing;
    }
  }

  tr.requirement > td.history {
    color: var(--secondaryText);
    text-decoration: underline;
    text-decoration-style: dashed;
  }

  tr.requirement > td:first-child {
    padding-left: 1rem;
  }

  tr.requirement > td:nth-last-child(2) {
    padding-right: 5rem;
  }

  tr.requirement:hover {
    background-color: var(--background2);
  }

  tr.requirement.selected {
    background-color: var(--backdrop);
  }

  tr.requirement.selected:hover {
    background-color: var(--background2);
  }

  :global(div.reqgroup.dragging tr.requirement) {
    background: none !important;
  }

  tr.requirement {
    margin: 0.2rem 0;
    border-radius: 0.4rem;
    overflow: hidden;
    cursor: pointer;
    position: relative;
  }

  tr.requirement.depth-1 {
    left: 3rem;
    td.iconCell {
      transform: translateX(-3rem);
    }
  }

  tr.requirement.depth-2 {
    left: 6rem;
    td.iconCell {
      transform: translateX(-6rem);
    }
  }

  .nestedPlaceholder {
    display: none;

    > td {
      height: 5rem;
      border: 0.2rem dashed var(--secondaryText);
      border-radius: 0.4rem;
      background-color: var(--background2);
      position: relative;
      transform: scaleY(0.7); // give some padding, kinda hack

      &:hover {
        background-color: var(--backdrop);
      }

      &.depth-1 {
        left: 3rem;
      }

      &.depth-2 {
        left: 6rem;
      }

      &.depth-3 {
        left: 9rem;
      }
    }
  }

  :global(.draggable-container--over .nestedPlaceholder) {
    display: table-row !important;
  }

  :global(.draggable-container--over .nestedPlaceholder.hidden) {
    display: none !important;
  }
</style>

{#if index === 0}
  <tr
    class={`nestedPlaceholder ${hiddenPlaceholders.includes(-1) ? 'hidden' : ''}`}>
    <td
      class="draggable depth-0"
      data-parentid={-1}
      data-isplaceholder={1}
      colspan={isPrioritized ? 7 : 6} />
  </tr>
{/if}
<tr
  class={`${selected ? 'selected' : ''} requirement draggable depth-${requirement.depth}`}
  on:click={() => toggleReq(requirement.id)}
  data-reqid={requirement.id}>
  <td class="reqHandle">
    <div class="iconWrapper">
      <FaGripVertical />
    </div>
  </td>
  <td class="desc">{requirement.description}</td>
  <td class="ppuid">#{requirement.ppuid}</td>
  <td class="status">
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
  </td>
  {#if isPrioritized}
    <td
      class="priority"
      style={`color:var(--${getPriorityColor(requirement.priority)})`}>
      {requirement.priority}
    </td>
  {/if}
  <td class="history">X at Y</td>
  <td class="iconCell">
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
  </td>
</tr>
<tr
  class={`nestedPlaceholder ${hiddenPlaceholders.includes(requirement.id) ? 'hidden' : ''}`}>
  <td
    class={`draggable depth-${requirement.depth + 1}`}
    colspan={isPrioritized ? 7 : 6}
    data-parentid={requirement.id}
    data-isplaceholder={1} />
</tr>
