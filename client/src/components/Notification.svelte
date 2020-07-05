<script>
  export let notification;
  import { format } from "date-fns";

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
    font-weight: 300;
  }

  .date {
    font-size: 1.4rem;
    margin-left: 1.6rem;
  }

  .entityLink {
    font-weight: bold;
  }

  .top {
    font-size: 1.4rem;
    margin-bottom: 0.8rem;
  }

  .top,
  .top a {
    color: var(--secondaryText);
  }
</style>

<div class="panel">
  <div class="top">
    <a href={`/team/${notification.team_id}`}>{notification.teamName}</a>
    /
    <a href={`/project/${notification.project_id}`}>
      {notification.projectName}
    </a>
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
      {#if notification.description && notification.actionType !== 'delete'}
        <a class="entityLink" href={getHref()}>{notification.description}</a>
      {:else if notification.actionType === 'delete'}
        <strong>{notification.description}</strong>
      {/if}
      <time class="date secondary" datetime={notification.created_at}>
        {format(new Date(notification.created_at), 'h:mm a, MMMM d, yyyy')}
      </time>
    </div>
  </div>
</div>
