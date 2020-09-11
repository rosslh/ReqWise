<script context="module">
  import { reqgroupTypeLabels, reviewStatusLabels } from "../../../utils";
  import { get } from "../../../api";
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
          href = `${projectUrl}/business-requirements`;
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
        "pending",
        "accept",
        "requestChanges",
        "withdrawn",
      ].map((status) => ({
        label: reviewStatusLabels[status].label,
        count: reviews.filter((x) => x.status === status).length,
        color: reviewStatusLabels[status].color,
      }));

      return { itemCounts, reviewCounts };
    }
  }
</script>

<script>
  export let itemCounts;
  export let reviewCounts;

  // const reviewCounts = [
  //   {
  //     label: "Pending",
  //     count: 19,
  //     color: "var(--indigo)",
  //   },
  //   {
  //     label: "Rejected",
  //     count: 3,
  //     color: "var(--red)",
  //   },
  //   {
  //     label: "Accepted",
  //     count: 2,
  //     color: "var(--green)",
  //   },
  //   {
  //     label: "Withdrawn",
  //     count: 4,
  //     color: "var(--secondaryText)",
  //   },
  // ];
</script>

<style>
  .dashboardWrapper {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -2rem;
  }
  .dashboardPanel {
    min-width: calc(50% - 4rem);
    margin: 2rem;
    min-height: 7rem;
  }

  ul {
    margin-bottom: 0;
  }
  li {
    list-style: none;
    font-weight: 600;
    font-size: 1.8rem;
  }

  li .counterNumber {
    font-weight: 700;
    min-width: 3rem;
    text-align: left;
    display: inline-block;
    font-size: 2rem;
  }

  .dashboardPanel h3 {
    margin-top: 0;
  }

  a.itemCount {
    color: var(--normalText);
  }
</style>

<section class="contentWrapper">
  <h2>Project dashboard</h2>
  <div class="dashboardWrapper">
    <div class="panel dashboardPanel">
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
      <h3>Reviews</h3>
      {#each reviewCounts as { count, label, color }}
        <li>
          <span class="counterNumber" style={`color: ${color}`}>{count}</span>
          <span class="counterLabel">{label}</span>
        </li>
      {/each}
    </div>
    <div class="panel dashboardPanel">
      <h3>Activity</h3>
    </div>
    <div class="panel dashboardPanel" />
  </div>
</section>
