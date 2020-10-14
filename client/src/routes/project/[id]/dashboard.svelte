<script context="module">
  import { reqgroupTypeLabels, reviewStatusLabels } from "../../../utils";
  import { get } from "../../../api";
  import Notification from "../../../components/Notification.svelte";
  import capitalize from "lodash/capitalize";

  export async function preload({ params }, { user }) {
    if (user && user.jwt) {
      const itemCounts = [];

      // requirements

      const numRequirements = (
        await get(`/projects/${params.id}/requirements`, user && user.jwt)
      ).length;

      itemCounts.push({
        label: numRequirements === 1 ? "Requirement" : "Requirements",
        count: numRequirements,
      });

      const projectUrl = `/project/${params.id}`;

      // reqgroups
      const reqgroups = await get(
        `/projects/${params.id}/reqgroups`,
        user && user.jwt
      );

      ["business", "feature", "quality"].forEach((type) => {
        const count = reqgroups.filter((x) => x.type === type).length;
        let href;
        if (type === "business") {
          href = `${projectUrl}/business-considerations`;
        } else if (type === "feature") {
          href = `${projectUrl}/features`;
        } else {
          href = `${projectUrl}/quality-attributes`;
        }
        itemCounts.push({
          label: capitalize(reqgroupTypeLabels(count !== 1)[type]),
          count,
          href,
        });
      });

      // Files

      const numFiles = (
        await get(`/projects/${params.id}/files`, user && user.jwt)
      ).length;

      itemCounts.push({
        label: numFiles === 1 ? "File" : "Files",
        count: numFiles,
        href: `${projectUrl}/files`,
      });

      // Userclasses

      const numUserclasses = (
        await get(`/projects/${params.id}/userclasses`, user && user.jwt)
      ).length;

      itemCounts.push({
        label: numUserclasses === 1 ? "User class" : "User classes",
        count: numUserclasses,
        href: `${projectUrl}/user-classes`,
      });

      const reviews = await get(
        `/projects/${params.id}/reviews`,
        user && user.jwt
      );

      const reviewCounts = [
        {
          href: `${projectUrl}/reviews?filter-reviewStatus=pending`,
          status: "pending",
        },
        {
          href: `${projectUrl}/reviews?filter-reviewStatus=accept`,
          status: "accept",
        },
        {
          href: `${projectUrl}/reviews?filter-reviewStatus=requestChanges`,
          status: "requestChanges",
        },
        {
          href: `${projectUrl}/reviews?filter-reviewStatus=withdrawn`,
          status: "withdrawn",
        },
      ].map(({ status, href }) => ({
        label: reviewStatusLabels[status].label,
        count: reviews.filter((x) => x.status === status).length,
        color: reviewStatusLabels[status].color,
        href: href,
      }));

      const maxNotifications = 4;

      const notifications = await get(
        `/projects/${params.id}/activity`,
        user && user.jwt
      );

      return {
        itemCounts,
        reviewCounts,
        moreNotifications: notifications.length > maxNotifications,
        notifications: notifications.slice(0, maxNotifications),
        params,
      };
    }
  }
</script>

<script>
  export let itemCounts;
  export let reviewCounts;
  export let notifications;
  export let params;
  export let moreNotifications;
</script>

<style>
  .dashboardWrapper {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -2rem;
  }
  .dashboardPanel {
    width: calc(50% - 4rem);
    margin: 2rem;
    min-height: 7rem;
  }

  @media (max-width: 860px) {
    .dashboardPanel {
      width: calc(100% - 4rem) !important;
    }
  }

  .dashboardPanel.wide {
    width: calc(100% - 4rem);
  }

  ul {
    margin-bottom: 0;
  }
  li {
    list-style: none;
    font-weight: 600;
  }

  li .counterNumber {
    font-weight: 700;
    min-width: 3rem;
    text-align: left;
    display: inline-block;
    font-size: 1.8rem;
  }

  .dashboardPanel h3 {
    margin: 0;
  }

  a.itemCount {
    color: var(--normalText);
    text-decoration: none !important;
  }

  a.itemCount span.counterLabel {
    text-decoration: underline;
  }

  a.activityLink {
    text-align: center;
    display: block;
  }

  .secondary {
    color: var(--secondaryText);
    text-align: center;
    display: block;
    margin: 2rem 0 1rem;
  }
</style>

<section class="contentWrapper">
  <h2 data-introjs="projectDashboardHeader">Project dashboard</h2>
  <div class="dashboardWrapper">
    <div class="panel dashboardPanel">
      <div class="panelHeader">
        <h3>Summary</h3>
      </div>
      <ul>
        {#each itemCounts as { count, label, href }}
          <li>
            {#if href}
              <a rel="prefetch" class="itemCount" {href}>
                <span class="counterNumber">{count}</span>
                <span class="counterLabel">{label}</span>
              </a>
            {:else}
              <span class="counterNumber">{count}</span>
              <span class="counterLabel">{label}</span>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
    <div class="panel dashboardPanel">
      <div class="panelHeader">
        <h3>Reviews</h3>
      </div>
      {#each reviewCounts as { count, label, color, href }}
        <li>
          <a rel="prefetch" class="itemCount" {href}>
            <span class="counterNumber" style={`color: ${color}`}>{count}</span>
            <span class="counterLabel">{label}</span>
          </a>
        </li>
      {/each}
    </div>
    <div class="panel dashboardPanel wide">
      <div class="panelHeader">
        <h3>Activity</h3>
      </div>
      {#each notifications as notification}
        <Notification
          {notification}
          compact
          context="dashboard"
          bgColor="var(--background2)" />
      {/each}
      {#if moreNotifications}
        <a
          class="activityLink"
          rel="prefetch"
          href={`/project/${params.id}/activity`}>
          View all activity
        </a>
      {:else if !notifications.length}
        <span class="secondary"> No recent activity </span>
      {/if}
    </div>
  </div>
</section>
