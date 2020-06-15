<script>
  export let requirements;

  const statusTypes = [
    {
      name: "proposed",
      color: "red",
      label: "Proposed"
    },
    {
      name: "accepted",
      color: "indigo",
      label: "Accepted"
    },
    {
      name: "modified",
      color: "orange",
      label: "Modified"
    },
    {
      name: "implemented",
      color: "green",
      label: "Implemented"
    }
  ];

  $: entries = requirements
    ? statusTypes.map(status => ({
        count: requirements.filter(req => req.status === status.name).length,
        status: status.name,
        color: status.color,
        label: status.label,
        name: status.name
      }))
    : [];

  let active = false;

  const roundNumber = num => Math.round((num + Number.EPSILON) * 10) / 10;
</script>

<style>
  .outerWrapper:hover .barsWrapper {
    opacity: 0.8;
  }

  .outerWrapper:not(:hover) .labelsWrapper {
    background-color: var(--background1);
  }

  .outerWrapper {
    cursor: pointer;
    transform: translateY(-0.25rem);
  }

  .outerWrapper.inactive {
    padding: 0.5rem 0;
    margin: -0.5rem 0;
  }

  .barsWrapper {
    width: calc(100% + 2.4rem); /* accounts for reqgroup padding */
    max-height: 0.3rem;
    overflow: hidden;
    padding: 0;
    margin: 0 -1.2rem;
    display: flex;
    justify-content: space-between;
  }
  .barsWrapper .entry {
    margin: 0;
    height: 4rem;
    box-sizing: content-box;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--background1);
  }

  .barsWrapper .entry:not(:last-child) {
    margin-right: 0.1rem;
  }

  .labelsWrapper {
    background-color: var(--background2);
    font-size: 1.5rem;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0.8rem 0;
    font-weight: 600;
    border-bottom: 0.1rem solid var(--borderColor);
    margin: 0 -1.2rem; /* accounts for reqgroup padding */
    /* border-top: none; */
    border-bottom-left-radius: 0.4rem;
    border-bottom-right-radius: 0.4rem;
  }

  .labelsWrapper .label {
    display: flex;
    align-items: center;
  }

  .labelsWrapper .label .labelText {
    margin: 0 0.7rem;
  }

  .labelsWrapper .label .labelPercent {
    color: var(--secondaryText);
  }

  .labelsWrapper .label .labelDot {
    height: 0.8rem;
    width: 0.8rem;
    display: inline-block;
    border-radius: 50%;
  }
</style>

<div
  class={`outerWrapper ${active ? 'active' : 'inactive'}`}
  on:click={() => {
    active = !active;
  }}>
  <div class="barsWrapper">
    {#each entries as entry (entry.name)}
      {#if entry.count}
        <div
          class="entry"
          style={`width: ${(entry.count / requirements.length) * 100}%; background-color: var(--${entry.color});`} />
      {/if}
    {/each}
  </div>
  {#if active}
    <div class="labelsWrapper">
      {#each entries as entry (entry.name)}
        {#if entry.count}
          <div class="label">
            <span
              class="labelDot"
              style={`background-color: var(--${entry.color})`} />
            <span class="labelText">{entry.label}</span>
            <span class="labelPercent">
              {roundNumber((entry.count / requirements.length) * 100)}%
            </span>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
