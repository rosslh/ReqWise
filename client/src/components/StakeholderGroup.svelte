<script>
  export let update;
  export let group;

  import { modalContent, modalProps } from "../stores.js";

  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";

  const editGroup = model => {
    // modalContent.set(EditModelDetailsModal);
    modalProps.set({
      model,
      update
    });
  };
  const deleteGroup = () => {
    // modalContent.set(deleteGroupModal);
    modalProps.set({
      model,
      update
    });
  };
</script>

<style>
  .stakeholderGroupWrapper {
    border: 0.1rem solid var(--borderColor);
    border-radius: 0.4rem;
    margin: 2rem 0;
    background-color: var(--background1);
    overflow: hidden;
  }

  .textContent {
    padding: 2rem;
  }

  .textContent p {
    margin-bottom: 0;
  }

  .textContent h3 {
    margin-top: 0;
    font-size: 1.8rem;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    padding: 0 2rem 2rem;
  }

  .footer button {
    margin: 0;
  }

  .modelPpuid {
    color: var(--secondaryText);
    font-weight: 300;
    margin-left: 0.5rem;
  }
</style>

<div class="stakeholderGroupWrapper">
  <div class="textContent">
    <h3>
      {group.name}
      <span class="modelPpuid">#{group.ppuid}</span>
    </h3>
    <p>{group.description}</p>
  </div>
  <div class="footer">
    <button
      on:click={() => editGroup(model)}
      class="button-outline button-small button-secondary button-clear">
      <div class="iconWrapper">
        <FaRegEdit />
      </div>
      Edit
    </button>
    <button
      on:click={deleteGroup}
      class="button-outline button-small button-secondary button-clear">
      <div class="iconWrapper">
        <FaRegTrashAlt />
      </div>
      Delete
    </button>
  </div>
</div>
