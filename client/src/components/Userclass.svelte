<script>
  export let update;
  export let userclass;

  import { modalContent, modalProps } from "../stores.js";
  import DeleteUserclassModal from "../components/DeleteUserclassModal.svelte";
  import EditUserclassModal from "../components/EditUserclassModal.svelte";

  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";

  const deleteUserclass = () => {
    modalContent.set(DeleteUserclassModal);
    modalProps.set({
      userclass,
      update
    });
  };
  const editUserclass = async () => {
    modalContent.set(EditUserclassModal);
    modalProps.set({
      update,
      userclass
    });
  };

  const getImportanceColor = status => {
    switch (status) {
      case "favored":
        return "green";
      case "disfavored":
        return "orange";
      case "ignored":
        return "red";
      default:
        return "indigo";
    }
  };
</script>

<style>
  .userclassWrapper {
    border: 0.1rem solid var(--borderColor);
    border-radius: 0.4rem;
    margin: 2rem 0;
    background-color: var(--background1);
    overflow: hidden;
  }

  .description,
  .persona,
  .champions {
    padding: 0 2rem;
  }

  div.userclassHeader {
    padding: 2rem 2rem 0;
  }

  div.userclassHeader h3 {
    margin: 0;
    font-size: 1.8rem;
  }

  div.userclassHeader .userclassPpuid {
    color: var(--secondaryText);
    font-weight: 300;
    margin-left: 0.5rem;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    padding: 0 2rem 2rem;
  }

  .footer button {
    margin: 0;
  }

  div.userclassHeader {
    display: flex;
    justify-content: space-between;
  }

  div.userclassHeader span.importanceLabel {
    padding: 0.4rem;
    border-radius: 0.4rem;
    color: #fff;
    font-size: 1.3rem;
    font-weight: 500;
  }

  h4 {
    margin-top: 1.8rem;
    margin-bottom: 0.6rem;
    font-size: 1.6rem;
  }

  .twoCol {
    display: flex;
    flex-wrap: wrap;
  }

  .twoCol > * {
    flex-grow: 1;
    min-width: 40rem;
  }

  .twoCol blockquote {
    margin-bottom: 0.5rem;
  }
</style>

<div class="userclassWrapper">
  <div class="userclassHeader">
    <div class="left">
      <h3>
        {userclass.name}
        <span class="userclassPpuid">#{userclass.ppuid}</span>
      </h3>
    </div>
    <div class="right">
      <span
        class="importanceLabel"
        style={`background-color: var(--${getImportanceColor(userclass.importance)})`}>
        {userclass.importance}
      </span>
    </div>
  </div>
  <div class="twoCol">
    <div class="description">
      <h4>Description</h4>
      <blockquote>{userclass.description}</blockquote>
    </div>
    <div class="persona">
      <h4>User Persona</h4>
      <blockquote>{userclass.persona}</blockquote>
    </div>
  </div>
  <div class="champions">
    <h4>Product Champions</h4>
    ...
  </div>
  <div class="footer">
    <button
      on:click={editUserclass}
      class="button-outline button-small button-secondary button-clear">
      <div class="iconWrapper">
        <FaRegEdit />
      </div>
      Edit details
    </button>
    <button
      on:click={deleteUserclass}
      class="button-outline button-small button-secondary button-clear">
      <div class="iconWrapper">
        <FaRegTrashAlt />
      </div>
      Delete
    </button>
  </div>
</div>
