<script>
  const itemCounts = [
    {
      label: "Requirements",
      count: 19,
    },
    {
      label: "Features",
      count: 3,
    },
    {
      label: "Business requirement groups",
      count: 2,
    },
    {
      label: "Quality attributes",
      count: 4,
    },
    {
      label: "Files",
      count: 3,
    },
    {
      label: "User classes",
      count: 5,
    },
  ];

  const reviewCounts = [
    {
      label: "Pending",
      count: 19,
      color: "var(--indigo)",
    },
    {
      label: "Rejected",
      count: 3,
      color: "var(--red)",
    },
    {
      label: "Accepted",
      count: 2,
      color: "var(--green)",
    },
    {
      label: "Withdrawn",
      count: 4,
      color: "var(--secondaryText)",
    },
  ];
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
</style>

<section class="contentWrapper">
  <h2>Project dashboard</h2>
  <div class="dashboardWrapper">
    <div class="panel dashboardPanel">
      <ul>
        {#each itemCounts as { count, label }}
          <li>
            <span class="counterNumber">{count}</span>
            <span class="counterLabel">{label}</span>
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
    <div class="panel dashboardPanel" />
    <div class="panel dashboardPanel" />
  </div>
</section>
