<script>
  export let notification;

  const getActionString = actionType => {
    if (actionType === "create") {
      return "created a new";
    } else if (actionType === "delete") {
      return "deleted a";
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
</script>

<style>
  span.secondary {
    color: var(--secondaryText);
  }
</style>

<div class="panel">
  {notification.name} {getActionString(notification.actionType)}
  {getEntityString(notification.entityType)}
  {#if notification.description}
    :
    <span class="secondary">{notification.description}</span>
  {/if}
</div>
