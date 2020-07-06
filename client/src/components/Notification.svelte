<script>
  export let notification;
  export let update;
  export let context = null;

  import { format } from "date-fns";
  import { put } from "../api.js";
  import { unreadAlerts } from "../stores.js";
  import { stores } from "@sapper/app";

  const { session } = stores();

  const getActionString = actionType => {
    if (actionType === "create") {
      return "created a new";
    } else if (actionType === "delete") {
      return "deleted a";
    } else if (actionType === "comment") {
      return "commented on";
    } else {
      return "updated a";
    }
  };

  const getEntityString = entityType => {
    if (entityType === "reqgroup") {
      return "requirement group";
    } else if (entityType === "stakeholderGroup") {
      return "stakeholder group";
    } else if (entityType === "userclass") {
      return "user class";
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
    } else {
      return `/project/${notification.project_id}/files/${notification.entity_file_id}`;
    }
  };

  const hasEntityId = () => {
    return (
      notification.entity_reqgroup_id ||
      notification.entity_stakeholderGroup_id ||
      notification.entity_userclass_id ||
      notification.entity_requirement_id ||
      notification.entity_file_id
    );
  };

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
    border-radius: 0.8rem;
    overflow: hidden;
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
  }

  .secondary {
    color: var(--secondaryText);
  }

  .date {
    font-size: 1.4rem;
  }

  .top {
    padding: 1.25rem 1.5rem;
    background-color: var(--background2);
    margin: -1.25rem -1.5rem 0; /* see .panel in main.css */
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
  <div class="top">
    <div class="left">
      <a rel="prefetch" href={`/team/${notification.team_id}`}>
        {notification.teamName}
      </a>
      /
      <a rel="prefetch" href={`/project/${notification.project_id}`}>
        {notification.projectName}
      </a>
      <span class="sep">&bull;</span>
      <time class="date secondary" datetime={notification.created_at}>
        {format(new Date(notification.created_at), 'h:mm a, MMMM d, yyyy')}
      </time>
    </div>
    {#if context !== 'activity'}
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
  <div class="bottom">
    <div class="imageWrapper">
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
      {#if hasEntityId() && notification.description && notification.actionType !== 'delete'}
        <a rel="prefetch" class="entityLink" href={getHref()}>
          {notification.description}
        </a>
      {:else if !hasEntityId() || notification.actionType === 'delete'}
        <strong>{notification.description}</strong>
      {/if}
    </div>
  </div>
</div>
