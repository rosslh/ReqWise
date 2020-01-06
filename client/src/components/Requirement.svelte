<script>
  import FaComment from "svelte-icons/fa/FaComment.svelte";
  export let requirement;
</script>

<style>
  div.commentIconWrapper {
    height: 1.8rem;
    width: 1.8rem;
    color: #bfbfbf;
  }
</style>

<tr>
  <td>Check</td>
  <td>{requirement.status}</td>
  <td>{requirement.pretty_id}</td>
  <td>{requirement.description}</td>
  <td>{requirement.priority}</td>
  <td>
    <div class="commentIconWrapper">
      <FaComment />
    </div>
  </td>
</tr>
