<script>
  export let update;
  export let group;

  import { modalContent, modalProps } from "../stores.js";
  import Skeleton from "./Skeleton.svelte";
  import AddStakeholderModal from "./AddStakeholderModal.svelte";
  import EditStakeholderGroupModal from "./EditStakeholderGroupModal.svelte";
  import DeleteStakeholderGroupModal from "./DeleteStakeholderGroupModal.svelte";
  import Stakeholder from "./Stakeholder.svelte";
  import ReqgroupHeader from "./ReqgroupHeader.svelte";

  import { get } from "../api.js";

  import { stores } from "@sapper/app";
  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import FaLink from "svelte-icons/fa/FaLink.svelte";

  const { session, page } = stores();

  $: projectId = $page.params.id;

  $: addStakeholder = () => {
    modalContent.set(AddStakeholderModal);
    modalProps.set({
      stakeholderGroupId: group.id,
      projectId,
      update: updateStakeholders
    });
  };
  const editGroup = () => {
    modalContent.set(EditStakeholderGroupModal);
    modalProps.set({ group, updateStakeholderGroup: update });
  };
  const deleteGroup = async () => {
    modalContent.set(DeleteStakeholderGroupModal);
    modalProps.set({ group, update });
  };

  let stakeholders = get(
    `/stakeholders/${group.id}/users`,
    $session.user && $session.user.jwt
  );

  const updateStakeholders = () => {
    stakeholders = get(
      `/stakeholders/${group.id}/users`,
      $session.user && $session.user.jwt
    );
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

  .users {
    padding: 0 2rem 2rem 2rem;
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

  .headerWrapper {
    margin: 2rem 2rem 0;
  }
</style>

<div class="stakeholderGroupWrapper">
  <div class="headerWrapper">
    <ReqgroupHeader reqgroup={group} />
  </div>
  <div class="users">
    {#await stakeholders}
      <Skeleton rows={2} />
    {:then result}
      <table>
        <tbody>
          {#each result as user}
            <Stakeholder
              {user}
              stakeholderGroupId={group.id}
              update={updateStakeholders} />
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
        on:click={() => alert('view reqs')}
        class="button-outline button-small button-secondary button-clear">
        <div class="iconWrapper">
          <FaLink />
        </div>
        Requirement groups
      </button>
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
