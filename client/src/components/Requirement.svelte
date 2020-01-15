<script>
  import FaRegComment from "svelte-icons/fa/FaRegComment.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import FaExclamation from "svelte-icons/fa/FaExclamation.svelte";
  import FaRegClock from "svelte-icons/fa/FaRegClock.svelte";
  import FaCheck from "svelte-icons/fa/FaCheck.svelte";
  import FaThumbsUp from "svelte-icons/fa/FaThumbsUp.svelte";

  export let requirement;
  export let featureId;
  export let toggleReq;
  export let selected;

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

  // \u2011 = non-breaking hyphen
  // \u200B = zero width space
  const normalizeString = str =>
    str.replace(/-/g, "\u2011").replace(/\./g, "\u200B.");
</script>

<style>
  div.commentIconWrapper {
    height: 1.6rem;
    width: 1.6rem;
  }

  td.priority {
    text-transform: capitalize;
  }

  td.checkbox > input {
    margin: 0;
    transform: scale(1.2);
    outline: none;
  }

  td:first-child {
    padding-left: 1rem;
  }
  td:last-child {
    padding-right: 1rem;
  }
  tr.requirement:hover {
    background-color: var(--offwhite2);
    cursor: pointer;
  }

  tr.requirement.selected {
    background-color: var(--offwhite2);
    cursor: pointer;
  }

  tr.requirement.selected:hover {
    background-color: var(--offwhite3);
    cursor: pointer;
  }
</style>

<tr
  class={`${selected ? 'selected' : ''} requirement`}
  on:click={() => toggleReq(requirement.id)}>
  <td class="checkbox">
    <input type="checkbox" checked={selected} />
  </td>
  <td
    class="status"
    style={`color:var(--${getStatusColor(requirement.status)})`}>
    {#if requirement.status === 'proposed'}
      <span class="iconWrapper">
        <FaExclamation />
      </span>
      <span>Proposed</span>
    {:else if requirement.status === 'accepted'}
      <span class="iconWrapper">
        <FaThumbsUp />
      </span>
      Accepted
    {:else if requirement.status === 'inProgress'}
      <span class="iconWrapper">
        <FaRegClock />
      </span>
      In Progress
    {:else}
      <span class="iconWrapper">
        <FaCheck />
      </span>
      Implemented
    {/if}
  </td>
  <td>{normalizeString(`${featureId}.${requirement.pretty_id}`)}</td>
  <td class="desc">{requirement.description}</td>
  <td
    class="priority"
    style={`color:var(--${getPriorityColor(requirement.priority)})`}>
    {requirement.priority}
  </td>
  <td>
    <div class="commentIconWrapper">
      {#if requirement.status === 'proposed'}
        <FaRegComment />
      {:else}
        <FaRegEdit />
      {/if}
    </div>
  </td>
</tr>
