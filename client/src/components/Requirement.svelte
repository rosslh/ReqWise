<script>
  import FaRegComment from "svelte-icons/fa/FaRegComment.svelte";
  import FaEdit from "svelte-icons/fa/FaEdit.svelte";
  import FaExclamation from "svelte-icons/fa/FaExclamation.svelte";
  import FaRegClock from "svelte-icons/fa/FaRegClock.svelte";
  import FaCheck from "svelte-icons/fa/FaCheck.svelte";
  export let requirement;
  export let featureId;
  export let toggleReq;
  export let selected;

  const getStatusColor = status => {
    switch (status) {
      case "proposed":
        return "var(--red)";
      case "accepted":
        return "var(--grey)";
      case "inProgress":
        return "var(--orange)";
      default:
        return "var(--green)";
    }
  };

  const getPriorityColor = status => {
    switch (status) {
      case "high":
        return "var(--red)";
      case "medium":
        return "var(--orange)";
      default:
        return "var(--grey)";
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

  span.iconWrapper {
    height: 1.3rem;
    width: 1.3rem;
    display: inline-block;
    transform: translateY(8%);
  }

  td.priority {
    text-transform: capitalize;
  }

  td.checkbox > input {
    margin: 0;
    transform: scale(1.2);
    outline: none;
  }
</style>

<tr>
  <td class="checkbox">
    <input
      type="checkbox"
      on:click={() => toggleReq(requirement.id)}
      checked={selected} />
  </td>
  <td class="status" style={`color:${getStatusColor(requirement.status)}`}>
    {#if requirement.status === 'proposed'}
      <span class="iconWrapper">
        <FaExclamation />
      </span>
      <span>Proposed</span>
    {:else if requirement.status === 'accepted'}
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
    style={`color:${getPriorityColor(requirement.priority)}`}>
    {requirement.priority}
  </td>
  <td>
    <div class="commentIconWrapper">
      {#if requirement.status === 'proposed'}
        <FaRegComment />
      {:else}
        <FaEdit />
      {/if}
    </div>
  </td>
</tr>
