<script>
  //   export let update;
  export let userclass;
  //   export let projectId;

  import { modalContent, modalProps } from "../stores.js";

  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";

  const deleteUserclass = () => {
    // modalContent.set(DeleteFileModal);
    // modalProps.set({
    //   file,
    //   update
    // });
  };
  const editUserclass = async () => {
    // modalContent.set(UploadFileModal);
    // modalProps.set({
    //   projectId,
    //   update,
    //   file
    // });
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
        return "secondaryText";
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

  .textContent {
    padding: 2rem;
  }

  .textContent p {
    margin-bottom: 0;
  }

  div.userclassHeader {
    padding: 2rem;
  }

  div.userclassHeader h3 {
    margin-top: 0;
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
  <div class="textContent">
    <p>{userclass.description}</p>
    <p>{userclass.persona}</p>
  </div>
  <div class="footer">
    <button
      on:click={() => {}}
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
