<script>
  export let questionnaire;
  export let projectId;
  import { formatDistanceToNow } from "date-fns";
  const formatDatetime = (dt) =>
    `Created ${formatDistanceToNow(new Date(dt))} ago`;
</script>

<style>
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .top h3 {
    font-size: 1.8rem;
    margin: 0;
  }
  .top a {
    color: var(--normalText);
  }
  .top time {
    color: var(--secondaryText);
    font-size: 1.4rem;
  }
</style>

<li class="panel">
  <div class="top panelHeader">
    <h3>
      <a href={`/project/${projectId}/brainstorm/forms/${questionnaire.id}`}>
        {questionnaire.description}
      </a>
    </h3>
    <time class="createdAt" datetime={questionnaire.created_at}>
      {formatDatetime(questionnaire.created_at)}
    </time>
  </div>
  <div class="bottom">
    {questionnaire.numPrompts} prompts and {questionnaire.numResponses}
    responses.
  </div>
</li>
