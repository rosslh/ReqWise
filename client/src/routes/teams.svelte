<script>
  const teams = [
    {
      name: "Facebook",
      numMembers: 56,
      createDate: "2019-01-01"
    }
  ];
</script>

<h1>My Teams</h1>

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Members</th>
      <th>Created</th>
    </tr>
  </thead>
  <tbody>
    {#each teams as team}
      <tr>
        <td>{team.name}</td>
        <td>{team.numMembers}</td>
        <td>{team.createDate}</td>
      </tr>
    {/each}
  </tbody>
</table>
