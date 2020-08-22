<script>
  export let update;
  export let group;
  export let unlinkReqgroup;

  import { modalContent, modalProps } from "../stores.js";
  import Skeleton from "./Skeleton.svelte";
  import AddStakeholderModal from "./AddStakeholderModal.svelte";
  import EditStakeholderGroupModal from "./EditStakeholderGroupModal.svelte";
  import DeleteStakeholderGroupModal from "./DeleteStakeholderGroupModal.svelte";
  import Stakeholder from "./Stakeholder.svelte";

  import { get, del } from "../api.js";

  import { stores } from "@sapper/app";
  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import FaLink from "svelte-icons/fa/FaLink.svelte";
  import FaUnlink from "svelte-icons/fa/FaUnlink.svelte";

  const { session, page } = stores();

  $: projectId = $page.params.id;

  $: addStakeholder = () => {
    modalContent.set(AddStakeholderModal);
    modalProps.set({
      stakeholderGroupId: group.id,
      projectId,
      update: updateStakeholders,
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

  const unlinkStakeholderGroup = async () => {
    await del(
      `/stakeholders/${group.id}/reqgroups/${unlinkReqgroup}`,
      $session.user && $session.user.jwt
    );
    await update();
  };
</script>

<style>
  .stakeholderGroupWrapper {
    box-shadow: var(--boxShadow);
    border-radius: 0.5rem;
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

  .footer button,
  .footer .button {
    margin: 0;
  }

  .headerWrapper {
    margin: 2rem 2rem 0;
  }

  div.groupHeader {
    background-color: var(--background1);
    margin: -1.25rem -1.25rem 0 -1.25rem;
    padding: 1.75rem 1.25rem;
    /* border-bottom: 0.1rem solid var(--borderColor); */
    min-height: 5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  div.groupHeader h3 {
    font-size: 1.8rem;
    display: inline;
    margin: 0;
    max-width: 50%;
    /* color: #333; */
  }

  .groupPpuid {
    color: var(--secondaryText);
    font-weight: 300;
    margin-left: 0.5rem;
  }

  h3 a {
    text-decoration: none;
    color: var(--normalText);
  }

  h3 a:hover {
    text-decoration: underline;
  }
</style>

<div class="stakeholderGroupWrapper">
  <div class="headerWrapper">
    <div class="groupHeader">
      <h3>
        <a
          rel="prefetch"
          href={`/project/${projectId}/stakeholders/group/${group.id}`}>
          {group.name}
        </a>
        <span class="groupPpuid">#{group.ppuid}</span>
      </h3>
    </div>
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
      {#if unlinkReqgroup}
        <button
          on:click={unlinkStakeholderGroup}
          class="button-outline button-small button-secondary button-clear">
          <div class="iconWrapper iconWrapper-padded">
            <FaUnlink />
          </div>
          Unlink stakeholder group
        </button>
      {:else}
        <a
          rel="prefetch"
          href={`/project/${projectId}/stakeholders/group/${group.id}/reqgroups`}
          class="button button-outline button-small button-secondary
          button-clear">
          <div class="iconWrapper iconWrapper-padded">
            <FaLink />
          </div>
          Requirement groups
        </a>
      {/if}
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
