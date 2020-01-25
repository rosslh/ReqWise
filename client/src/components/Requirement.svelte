<script>
  import FaRegComment from "svelte-icons/fa/FaRegComment.svelte";
  import FaGithub from "svelte-icons/fa/FaGithub.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import FaExclamation from "svelte-icons/fa/FaExclamation.svelte";
  import FaRegClock from "svelte-icons/fa/FaRegClock.svelte";
  import FaCheck from "svelte-icons/fa/FaCheck.svelte";
  import FaThumbsUp from "svelte-icons/fa/FaThumbsUp.svelte";

  export let requirement;
  // export let featureId;
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
  // const normalizeString = str =>
  //   str.replace(/-/g, "\u2011").replace(/\./g, "\u200B.");
</script>

<style lang="scss">
  td.iconCell {
    position: absolute;
    right: 5rem;
    padding: 0 !important;
    border: none;
    width: 0;

    button.commentIconWrapper {
      background-color: var(--offwhite1);
      border: 1px solid var(--grey2);
      border-radius: 50%;
      height: 3.3rem;
      width: 3.3rem;
      padding: 0.8rem !important;
      color: var(--grey4);
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
  <td class="status">
    {#if requirement.status === 'proposed'}
      <span
        class="iconWrapper"
        style={`color:var(--${getStatusColor(requirement.status)})`}>
        <FaExclamation />
      </span>
      <span>Proposed</span>
    {:else if requirement.status === 'accepted'}
      <span
        class="iconWrapper"
        style={`color:var(--${getStatusColor(requirement.status)})`}>
        <FaThumbsUp />
      </span>
      Accepted
    {:else if requirement.status === 'inProgress'}
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
      Implemented
    {/if}
  </td>
  <td>
    {#if requirement.status === 'accepted'}
      <button class="button-small button-outline">
        <span class="iconWrapper">
          <FaGithub />
        </span>
        Implement
      </button>
    {:else if requirement.status === 'inProgress' || requirement.status === 'implemented'}
      <button class="button-small button-secondary button-outline button-clear">
        <span class="iconWrapper">
          <FaGithub />
        </span>
        Open
      </button>
    {/if}
  </td>
  <!-- <td>{normalizeString(`${featureId}.${requirement.pretty_id}`)}</td> -->
  <td class="desc">{requirement.description}</td>
  <td
    class="priority"
    style={`color:var(--${getPriorityColor(requirement.priority)})`}>
    {requirement.priority}
  </td>
  <td class="history">X at Y</td>
  <td class="iconCell">
    <button class="commentIconWrapper">
      {#if requirement.status === 'proposed'}
        <FaRegComment />
      {:else}
        <FaRegEdit />
      {/if}
    </button>
  </td>
</tr>
