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
  td.iconCell {
    position: absolute;
    right: 5rem;
    padding: 0 !important;
    border: none;
    width: 0;

    button.commentIconWrapper {
      background-color: var(--background1);
      border: 1px solid var(--grey2);
      border-radius: 50%;
      height: 3.3rem;
      width: 3.3rem;
      padding: 0.8rem !important;
      color: var(--charcoal1);
      box-sizing: border-box;
      transform: translateY(0.5rem);
      margin: 0;

      &:hover {
        color: var(--themeColor);
        background-color: white;
        opacity: 1 !important;
      }
    }
  }

  td.ppuid {
    color: var(--grey4);
  }

  td.priority {
    text-transform: capitalize;
  }

  td.status {
    white-space: nowrap !important;
  }

  td.checkbox > input {
    margin: 0;
    transform: scale(1.2);
    outline: none;
  }

  td.history {
    color: var(--grey4);
    text-decoration: underline;
    text-decoration-style: dashed;
  }

  td:first-child {
    padding-left: 1rem;
  }

  td:nth-last-child(2) {
    padding-right: 5rem;
  }

  tr.requirement:hover {
    background-color: var(--background2);
    cursor: pointer;
  }

  tr.requirement.selected {
    background-color: var(--background2);
    cursor: pointer;
  }

  tr.requirement.selected:hover {
    background-color: var(--background3);
    cursor: pointer;
  }
</style>

<tr
  class={`${selected ? 'selected' : ''} requirement`}
  on:click={() => toggleReq(requirement.id)}>
  <td class="checkbox">
    <input type="checkbox" checked={selected} />
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
