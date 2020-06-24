<script>
  export let update;
  export let userclass;
  export let projectId;
  export let unlinkRequirement;

  import { modalContent, modalProps } from "../stores.js";
  import { get, del } from "../api.js";
  import DeleteUserclassModal from "../components/DeleteUserclassModal.svelte";
  import EditUserclassModal from "../components/EditUserclassModal.svelte";
  import AddProductChampionModal from "../components/AddProductChampionModal.svelte";
  import Skeleton from "../components/Skeleton.svelte";
  import ProductChampion from "../components/ProductChampion.svelte";

  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaUnlink from "svelte-icons/fa/FaUnlink.svelte";
  import FaLink from "svelte-icons/fa/FaLink.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import { stores } from "@sapper/app";
  const { session } = stores();

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

  let champions = get(
    `/userclasses/${userclass.id}/champions`,
    $session.user && $session.user.jwt
  );

  const updateChampions = () => {
    champions = get(
      `/userclasses/${userclass.id}/champions`,
      $session.user && $session.user.jwt
    );
  };

  const addChampion = () => {
    modalContent.set(AddProductChampionModal);
    modalProps.set({
      update: updateChampions,
      userclassId: userclass.id,
      projectId
    });
  };

  const unlinkUserclass = async () => {
    await del(
      `/userclasses/${userclass.id}/requirements/${unlinkRequirement}`,
      $session.user && $session.user.jwt
    );
    await update();
  };
</script>

<style>
  .userclassWrapper {
    box-shadow: var(--boxShadow);
    border-radius: 0.8rem;
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
    display: flex;
    justify-content: space-between;
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
    justify-content: space-between;
    padding: 0 2rem 2rem;
  }
  .footer button,
  .footer .button {
    margin: 0;
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

  .championEmptyState {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 4rem;
    margin-bottom: 2rem;
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
    {#await champions}
      <Skeleton rows={2} />
    {:then result}
      {#if !result.length}
        <div class="championEmptyState">
          <button
            class="button button-small button-outline"
            on:click={addChampion}>
            add product champion
          </button>
        </div>
      {/if}
      <table>
        <tbody>
          {#each result as champion}
            <ProductChampion
              {champion}
              userclassId={userclass.id}
              update={updateChampions} />
          {/each}
        </tbody>
      </table>
    {:catch error}
      <section class="contentWrapper">
        <p style="color: var(--red)">{error.message}</p>
      </section>
    {/await}
  </div>
  <div class="footer">
    <div class="left">
      {#await champions}
        <Skeleton rows={2} />
      {:then result}
        {#if result.length}
          <button
            class="button button-success button-small button-outline"
            on:click={addChampion}>
            add champion
          </button>
        {/if}
      {/await}
    </div>
    <div class="right">
      {#if unlinkRequirement}
        <button
          on:click={unlinkUserclass}
          class="button-outline button-small button-secondary button-clear">
          <div class="iconWrapper iconWrapper-padded">
            <FaUnlink />
          </div>
          Unlink user class
        </button>
      {:else}
        <a
          href={`/project/${projectId}/user-classes/${userclass.id}/requirements`}
          class="button button-outline button-small button-secondary
          button-clear">
          <div class="iconWrapper iconWrapper-padded">
            <FaLink />
          </div>
          Requirements
        </a>
      {/if}
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
</div>
