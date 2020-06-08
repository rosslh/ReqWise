<script>
  export let user;

  const initialDesc = user.description;
  let newDesc = user.description;

  const removeStakeholder = () => {};

  const cancelEdit = () => {
    newDesc = initialDesc;
  };

  const saveEdit = () => {};
</script>

<style>
  fieldset.stakeholderNotes {
    margin-bottom: 0;
  }

  fieldset.stakeholderNotes input {
    margin-left: 0;
  }
</style>

<tr>
  <td>{user.name}</td>
  <td>
    <fieldset class="inline stakeholderNotes">
      <input type="text" bind:value={newDesc} />
    </fieldset>
  </td>
  <td class="actions">
    {#if initialDesc !== newDesc}
      <button
        class="button-success button-small button-outline"
        style="margin: 0;"
        on:click={saveEdit}>
        Save
      </button>
      <button
        class="button-outline button-small button-secondary button-clear"
        style="margin: 0;"
        on:click={cancelEdit}>
        Cancel
      </button>
    {:else}
      <button
        class="button-danger button-small button-outline"
        style="margin: 0;"
        on:click={() => removeStakeholder(user.id)}>
        Remove stakeholder
      </button>
    {/if}
  </td>
</tr>
