<script>
  export let champion;
  export let userclassId;
  export let update;

  import { put, del } from "../api.js";

  import { stores } from "@sapper/app";

  const initialDesc = champion.description;
  let newDesc = champion.description;

  const removeChampion = async () => {
    await del(
      `/userclasses/${userclassId}/champions/${champion.id}`,
      $session.user && $session.user.jwt
    );
    update();
  };

  const cancelEdit = () => {
    newDesc = initialDesc;
  };

  const { session } = stores();

  const saveEdit = async () => {
    await put(
      `/userclasses/${userclassId}/champions/${champion.id}`,
      { description: newDesc },
      $session.user && $session.user.jwt
    );
    update();
  };
</script>

<style>
  fieldset.championNotes {
    margin-bottom: 0;
  }

  fieldset.championNotes input {
    margin-left: 0;
  }

  td:last-child {
    text-align: right;
  }
</style>

<tr>
  <td>{champion.name}</td>
  <td>
    <fieldset class="inline championNotes">
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
        on:click={() => removeChampion(champion.id)}>
        Remove champion
      </button>
    {/if}
  </td>
</tr>
