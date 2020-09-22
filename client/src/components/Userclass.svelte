<script>
  export let update;
  export let userclass;
  export let projectId;
  export let unlinkRequirement;
  export let baselineSourceId;

  const userclassId = baselineSourceId || userclass.id;

  export let hideStakeholderStatus = false;
  $: showEditButtons =
    userclass.is_draft && !userclass.is_baseline && scopes.includes("member");

  import { modalContent, modalProps } from "../stores.js";
  import { del } from "../api.js";
  import DeleteUserclassModal from "./DeleteUserclassModal.svelte";
  import EditUserclassModal from "./EditUserclassModal.svelte";
  import MakeDraftModal from "./MakeDraftModal.svelte";
  import UndraftModal from "./UndraftModal.svelte";
  import StakeholderStatus from "./StakeholderStatus.svelte";

  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaUnlink from "svelte-icons/fa/FaUnlink.svelte";
  import FaLink from "svelte-icons/fa/FaLink.svelte";
  import FaRegEdit from "svelte-icons/fa/FaRegEdit.svelte";
  import { getContext } from "svelte";
  import { stores } from "@sapper/app";
  import MdHistory from "svelte-icons/md/MdHistory.svelte";
  const { session } = stores();

  const deleteUserclass = () => {
    modalContent.set(DeleteUserclassModal);
    modalProps.set({
      userclass,
      update,
    });
  };
  const editUserclass = async () => {
    modalContent.set(EditUserclassModal);
    modalProps.set({
      update,
      userclass,
    });
  };

  const getImportanceColor = (status) => {
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

  const unlinkUserclass = async () => {
    await del(
      `/userclasses/${userclassId}/requirements/${unlinkRequirement}`,
      $session.user && $session.user.jwt
    );
    await update();
  };

  const scopes = getContext("scopes");

  const makeDraft = () => {
    modalContent.set(MakeDraftModal);
    modalProps.set({
      entityId: userclassId,
      entityType: "userclass",
      update,
    });
  };

  const undraft = () => {
    modalContent.set(UndraftModal);
    modalProps.set({
      entityId: userclassId,
      entityType: "userclass",
      update,
    });
  };
</script>

<style>
  .userclassWrapper {
    box-shadow: var(--boxShadow);
    border-radius: 0.5rem;
    margin: 2rem 0;
    background-color: var(--background1);
    overflow: hidden;
  }

  div.userclassHeader {
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    border-bottom: 0.1rem solid var(--borderColor);
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

  div.userclassHeader .right {
    display: flex;
    align-items: center;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    height: 5rem;
    border-top: 0.1rem solid var(--borderColor);
  }
  .footer button,
  .footer .button {
    margin: 0;
  }

  div.userclassHeader span.importanceLabel {
    padding: 0 0.5rem;
    border-radius: 0.4rem;
    color: #fff;
    font-size: 1.3rem;
    font-weight: 500;
    height: 2.5rem;
    display: flex;
    align-items: center;
    margin-right: 1rem;
  }

  h4 {
    margin-top: 1.8rem;
    margin-bottom: 0.6rem;
    font-size: 1.6rem;
  }

  .twoCol {
    background-color: var(--background2);
    padding: 0 2rem 1.5rem;
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

  h3 a {
    text-decoration: none;
    color: var(--normalText);
  }

  h3 a:hover {
    text-decoration: underline;
  }
</style>

<div class="userclassWrapper">
  <div class="userclassHeader">
    <div class="left">
      <h3>
        <a
          rel="prefetch"
          href={`/project/${projectId}/user-classes/${userclassId}`}>
          {userclass.name}
        </a>
        <span class="userclassPpuid">#{userclass.ppuid}</span>
      </h3>
    </div>
    <div class="right">
      <span
        class="importanceLabel"
        style={`background-color: var(--${getImportanceColor(userclass.importance)})`}>
        {userclass.importance}
      </span>
      {#if !hideStakeholderStatus}
        <StakeholderStatus
          isDraft={userclass.is_draft}
          latestReviewStatus={userclass.latestReview && userclass.latestReview.status}
          latestReviewId={userclass.latestReview && userclass.latestReview.id} />
      {/if}
    </div>
  </div>
  <div class="twoCol">
    <div class="description">
      <h4>Description</h4>
      <blockquote>
        {#if userclass.description}
          {userclass.description}
        {:else}<em>No description</em>{/if}
      </blockquote>
    </div>
    <div class="persona">
      <h4>User Persona</h4>
      <blockquote>
        {#if userclass.persona}
          {userclass.persona}
        {:else}<em>No persona</em>{/if}
      </blockquote>
    </div>
  </div>
  <div class="footer">
    <div class="left" />
    <div class="right">
      <a
        rel="prefetch"
        href={`/project/${projectId}/user-classes/${userclassId}/history`}
        class="button button-outline button-small button-secondary button-clear">
        <div class="iconWrapper">
          <MdHistory />
        </div>
        History
      </a>
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
          rel="prefetch"
          href={`/project/${projectId}/user-classes/${userclassId}/requirements`}
          class="button button-outline button-small button-secondary
            button-clear">
          <div class="iconWrapper iconWrapper-padded">
            <FaLink />
          </div>
          Requirements
        </a>
      {/if}
      {#if !userclass.is_baseline && scopes.includes('member')}
        {#if !userclass.is_draft}
          <button
            id="makeDraftButton"
            on:click={makeDraft}
            class="button-outline button-small button-secondary button-clear">
            <div class="iconWrapper">
              <FaRegEdit />
            </div>
            Convert to draft
          </button>
        {:else}
          <button
            id="undraftButton"
            on:click={undraft}
            class="button-outline button-small button-secondary button-clear">
            <div class="iconWrapper">
              <FaRegEdit />
            </div>
            Undraft
          </button>
        {/if}
      {/if}
      {#if showEditButtons}
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
      {/if}
    </div>
  </div>
</div>
