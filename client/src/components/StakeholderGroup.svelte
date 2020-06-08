<script>
  export let update;
  export let group;

  import { modalContent, modalProps } from "../stores.js";
  import Skeleton from "./Skeleton.svelte";
  import AddStakeholderModal from "./AddStakeholderModal.svelte";
  import Stakeholder from "./Stakeholder.svelte";

  import { get } from "../api.js";

  import { stores } from "@sapper/app";
  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";

  const { session, page } = stores();

  $: projectId = $page.params.id;

  $: addStakeholder = () => {
    modalContent.set(AddStakeholderModal);
    modalProps.set({ stakeholderGroupId: group.id, projectId, update });
  };
  const editGroup = () => {};
  const deleteGroup = () => {};

  const stakeholders = get(
    `/stakeholders/${group.id}/users`,
    $session.user && $session.user.jwt
  );
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
    padding: 2rem 2rem 1rem;
  }

  .users {
    padding: 0 2rem 2rem 2rem;
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
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem 2rem;
  }

  .footer button {
    margin: 0;
  }

  .stakeholderGroupPpuid {
    color: var(--secondaryText);
    font-weight: 300;
    margin-left: 0.5rem;
  }
</style>

<div class="stakeholderGroupWrapper">
  <div class="textContent">
    <h3>
      {group.name}
      <span class="stakeholderGroupPpuid">#{group.ppuid}</span>
    </h3>
    {#if group.description}
      <p>{group.description}</p>
    {/if}
  </div>
  <div class="users">
    {#await stakeholders}
      <Skeleton rows={2} />
    {:then result}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Notes</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {#each result as user (user.id)}
            <Stakeholder {user} />
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
    <div class="footerLeft">
      <button class="button-create" on:click={addStakeholder}>
        Add stakeholder
      </button>
    </div>
    <div class="footerRight">
      <button
        on:click={editGroup}
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
</div>
