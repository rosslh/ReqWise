<script>
  import FaExclamation from "svelte-icons/fa/FaExclamation.svelte";
  import FaThumbsUp from "svelte-icons/fa/FaThumbsUp.svelte";
  import FaCheck from "svelte-icons/fa/FaCheck.svelte";
  import FaGripVertical from "svelte-icons/fa/FaGripVertical.svelte";

  import { modalContent, modalProps } from "../stores.js";
  import ViewRequirementHistoryModal from "./ViewRequirementHistoryModal.svelte";
  import RequirementDropzone from "./RequirementDropzone.svelte";

  import { formatDistanceToNow } from "date-fns";

  export let requirement;
  export let toggleReq = () => {};
  export let selected = false;
  export let update;
  export let isPrioritized = true;
  export let hiddenPlaceholders = [];
  export let index = 0;
  export let isContextModal = false;
  export let close = () => {};

  const formatDatetime = dt => `${formatDistanceToNow(new Date(dt))} ago`;

  const getStatusColor = status => {
    switch (status) {
      case "proposed":
        return "red";
      case "accepted":
        return "indigo";
      case "modified":
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

  const showHistoryModal = id => {
    modalContent.set(ViewRequirementHistoryModal);
    modalProps.set({
      id,
      isPrioritized,
      update,
      url: `/project/${requirement.project_id}/requirement/${id}/history`
    });
  };
</script>

<style lang="scss">
  li.requirement {
    border-bottom: 0.1rem solid var(--borderColor);
    font-size: 1.5rem;
  }

  li.requirement > div {
    padding: 0.6rem 1.6rem;
    margin: 0;
    min-height: 4.5rem;
    display: flex;
    align-items: center;
  }

  li.requirement > div.desc {
    flex-grow: 1;
    min-width: 20rem;
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
    padding-right: 0.5rem;
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

    :global(.gripWrapper svg) {
      height: 1.7rem;
      width: 1.7rem;
      vertical-align: middle;
    }
  }

  li.requirement > div.history button,
  li.requirement > div.history a.button {
    color: var(--secondaryText);
    text-decoration: underline !important;
    text-decoration-style: dashed !important;
    font-size: 1.5rem;
    background: none;
    border: none;
    text-transform: unset;
    font-weight: 400;
    height: unset;
    padding: 0.2rem;
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
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  li.requirement.noninteractive {
    cursor: default !important;
  }

  @for $i from 0 through 10 {
    li.requirement.depth-#{$i} {
      transform: translateX(3rem * $i);
      margin-right: 3rem * $i;
    }
  }

  :global(.draggable-container--over .nestedPlaceholder) {
    visibility: visible !important;
  }

  :global(.draggable-container--over .nestedPlaceholder.hidden) {
    visibility: hidden !important;
  }

  .statusIconWrapper {
    margin-right: 0.5rem;
  }
  :global(.statusIconWrapper svg) {
    width: 1.5rem;
    height: 1.5rem;
    margin-top: 0.8rem;
  }

  button,
  .button {
    margin-top: 0;
  }
</style>

{#if index === 0}
  <RequirementDropzone {hiddenPlaceholders} parentId={-1} depth={0} />
{/if}
<li
  class={`${selected ? 'selected' : ''} ${isContextModal ? 'noninteractive' : ''} requirement draggable depth-${requirement.depth}`}
  on:click={() => toggleReq(requirement.id)}
  data-reqdesc={requirement.description}
  data-reqid={requirement.id}>
  {#if !isContextModal}
    <div class="reqHandle">
      <div class="gripWrapper">
        <FaGripVertical />
      </div>
    </div>
  {/if}
  <div class="desc">{requirement.description}</div>
  <div class="ppuid">#{requirement.ppuid}</div>
  <div class="status">
    {#if requirement.status === 'proposed'}
      <span
        class="statusIconWrapper"
        style={`color:var(--${getStatusColor(requirement.status)})`}>
        <FaExclamation />
      </span>
      <span class="statusText">Proposed</span>
    {:else if requirement.status === 'accepted'}
      <span
        class="statusIconWrapper"
        style={`color:var(--${getStatusColor(requirement.status)})`}>
        <FaThumbsUp />
      </span>
      <span class="statusText">Accepted</span>
    {:else if requirement.status === 'modified'}
      <span
        class="statusIconWrapper"
        style={`color:var(--${getStatusColor(requirement.status)})`}>
        <FaExclamation />
      </span>
      <span class="statusText">Modified</span>
    {:else}
      <span
        class="statusIconWrapper"
        style={`color:var(--${getStatusColor(requirement.status)})`}>
        <FaCheck />
      </span>
      <span class="statusText">Implemented</span>
    {/if}
  </div>
  {#if isPrioritized}
    <div
      class="priority"
      style={`color:var(--${getPriorityColor(requirement.priority)})`}>
      {requirement.priority}
    </div>
  {/if}
  <div class="history">
    {#if !isContextModal}
      <button on:click|stopPropagation={() => showHistoryModal(requirement.id)}>
        {requirement.authorName} {formatDatetime(requirement.created_at)}
      </button>
    {:else}
      <a
        on:click={close}
        href={`/project/${requirement.project_id}/requirement/${requirement.id}/history`}
        class="button">
        {requirement.authorName} {formatDatetime(requirement.created_at)}
      </a>
    {/if}
  </div>
  <slot />
</li>
<RequirementDropzone
  {hiddenPlaceholders}
  parentId={requirement.id}
  depth={requirement.depth + 1} />
