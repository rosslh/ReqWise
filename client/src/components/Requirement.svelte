<script>
  import FaComment from "svelte-icons/fa/FaComment.svelte";
  import FaExclamation from "svelte-icons/fa/FaExclamation.svelte";
  import FaRegClock from "svelte-icons/fa/FaRegClock.svelte";
  import FaCheck from "svelte-icons/fa/FaCheck.svelte";
  export let requirement;
  export let featureId;

  const getColor = status => {
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

  // \u2011 = non-breaking hyphen
  // \u200B = zero width space
  const normalizeString = str =>
    str.replace(/-/g, "\u2011").replace(/\./g, "\u200B.");
</script>

<style>
  div.commentIconWrapper {
    height: 1.8rem;
    width: 1.8rem;
    color: #bfbfbf;
  }

  span.iconWrapper {
    height: 1.4rem;
    width: 1.4rem;
    display: inline-block;
  }

  td.status {
    line-height: 1.5rem;
  }

  td.desc {
    color: #333;
  }
</style>

<tr>
  <td>
    <input type="checkbox" />
  </td>
  <td class="status" style={`color:${getColor(requirement.status)}`}>
    {#if requirement.status === 'proposed'}
      <span class="iconWrapper">
        <FaExclamation />
      </span>
      Proposed
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
  <td>{requirement.priority}</td>
  <td>
    <div class="commentIconWrapper">
      <FaComment />
    </div>
  </td>
</tr>
