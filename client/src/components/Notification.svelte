<script>
  export let notification;
  export let update;
  export let context = null;
  export let compact = false;

  import { format } from "date-fns";
  import normalizeString from "lodash/lowerCase";
  import { put } from "../api.js";
  import { unreadAlerts } from "../stores.js";
  import { stores } from "@sapper/app";

  const { session } = stores();

  const getActionString = (actionType) => {
    if (actionType === "create") {
      return "created a new";
    } else if (actionType === "delete") {
      return "deleted";
    } else if (actionType === "comment") {
      return "commented on";
    } else if (actionType === "changeStatus") {
      return "changed the status of";
    } else {
      return "updated";
    }
  };

  const getEntityString = (entityType) => {
    if (entityType === "reqgroup") {
      return "requirement group";
    } else if (entityType === "stakeholderGroup") {
      return "stakeholder group";
    } else if (entityType === "userclass") {
      return "user class";
    } else if (entityType === "reqversion") {
      return "requirement";
    } else if (entityType === "stakeholderReview") {
      return "review";
    } else {
      return entityType;
    }
  };

  const getHref = () => {
    if (notification.entityType === "reqgroup") {
      return `/project/${notification.project_id}/reqgroup/${notification.entity_reqgroup_id}`;
    } else if (notification.entityType === "stakeholderGroup") {
      return `/project/${notification.project_id}/stakeholders/${notification.entity_stakeholderGroup_id}`;
    } else if (notification.entityType === "userclass") {
      return `/project/${notification.project_id}/user-classes/${notification.entity_userclass_id}`;
    } else if (notification.entityType === "requirement") {
      return `/project/${notification.project_id}/requirement/${notification.entity_requirement_id}`;
    } else if (notification.entityType === "reqversion") {
      return `/project/${notification.project_id}/requirement/${notification.requirement_id}`;
    } else if (notification.entityType === "questionnaire") {
      return `/project/${notification.project_id}/brainstorm/forms/${notification.entity_brainstormForm_id}`;
    } else if (notification.entityType === "stakeholderReview") {
      return `/project/${notification.project_id}/reviews/${notification.entity_stakeholderReview_id}`;
    } else {
      return `/project/${notification.project_id}/files/${notification.entity_file_id}`;
    }
  };

  $: hasEntityId =
    notification.entity_reqgroup_id ||
    notification.entity_stakeholderGroup_id ||
    notification.entity_userclass_id ||
    notification.entity_requirement_id ||
    (notification.entity_reqversion_id && notification.requirement_id) ||
    notification.entity_file_id ||
    notification.entity_brainstormForm_id ||
    notification.entity_stakeholderReview_id;

  const toggleRead = async () => {
    const is_read = !notification.is_read;
    if (!is_read) {
      $unreadAlerts = true;
    }
    const data = { is_read };
    await put(
      `/alerts/${notification.id}`,
      data,
      $session.user && $session.user.jwt
    );
    await update();
  };
</script>

<style>
  div.imageWrapper {
    height: 3rem;
    width: 3rem;
    margin-right: 1.6rem;
  }

  div.imageWrapper img,
  :global(div.imageWrapper svg) {
    max-height: 100%;
    max-width: 100%;
  }

  .bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .bottomLeft {
    display: flex;
    align-items: center;
  }

  .secondary {
    color: var(--secondaryText);
  }

  .date {
    font-size: 1.4rem;
  }

  .top .sep {
    margin: 0 0.5rem;
  }

  .entityLink {
    font-weight: 600;
  }

  .top {
    font-size: 1.4rem;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
  }

  .top button {
    margin: 0;
    padding-left: 0;
    padding-right: 0;
  }

  .top > .left {
    flex-grow: 1;
  }

  .top,
  .top a {
    color: var(--secondaryText);
  }
</style>

<div class="panel">
  {#if !compact}
    <div class="top panelHeader">
      <div class="left">
        <a rel="prefetch" href={`/team/${notification.team_id}`}>
          {notification.teamName}
        </a> / <a rel="prefetch" href={`/project/${notification.project_id}`}>
          {notification.projectName}
        </a>
        <span class="sep">&bull;</span>
        <time class="date secondary" datetime={notification.created_at}>
          {format(new Date(notification.created_at), 'h:mm a, MMMM d, yyyy')}
        </time>
      </div>
      {#if context === 'notifications'}
        <div class="right">
          <button
            on:click={toggleRead}
            class="button button-small button-outline button-clear
              button-secondary">
            {#if notification.is_read}Mark as unread{:else}Mark as read{/if}
          </button>
        </div>
      {/if}
    </div>
  {/if}
  <div class="bottom">
    <div class="bottomLeft">
      <div class="imageWrapper squircle">
        {#if notification.authorImageName}
          <img
            src={`https://storage.googleapis.com/user-file-storage/${notification.authorImageName}`}
            alt={notification.authorName} />
        {:else if notification.authorPlaceholderImage}
          {@html notification.authorPlaceholderImage}
        {/if}
      </div>
      <div>
        <strong>{notification.authorName}</strong>
        <span class="secondary">
          {getActionString(notification.actionType)}
          {getEntityString(notification.entityType)}
        </span>
        {#if hasEntityId && notification.description && notification.actionType !== 'delete'}
          <a rel="prefetch" class="entityLink" href={getHref()}>
            {notification.description}
          </a>
        {:else if !hasEntityId || notification.actionType === 'delete'}
          <strong>{notification.description || ''}</strong>
        {/if}
        {#if notification.newValue}
          to <strong>{normalizeString(notification.newValue)}</strong>
        {/if}
      </div>
    </div>
    <div class="bottomRight">
      {#if compact}
        <time class="date compact secondary" datetime={notification.created_at}>
          {format(new Date(notification.created_at), 'h:mm a, MMMM d, yyyy')}
        </time>
      {/if}
    </div>
  </div>
</div>
