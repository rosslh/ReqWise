<script>
  import { onMount } from "svelte";
  import { get } from "../../api.js";

  import { stores } from "@sapper/app";
  const { page } = stores();

  let name = "";
  let description = "";

  let projects = [];
  let members = [];

  let loaded = false;

  onMount(async () => {
    const { id } = $page.params;
    ({ name, description } = await get(`/teams/${id}`));
    projects = await get(`/teams/${id}/projects`);
    members = await get(`/teams/${id}/members`);
    loaded = true;
  });
</script>

<style lang="scss">
  $red: #ff0000;
  div {
    label {
      color: $red;
    }
  }
</style>

<h1>{name}</h1>
{#if loaded}
  <div>
    <label for="name">Team name</label>
    <input id="name" type="text" bind:value={name} />
  </div>
  <div>
    <label for="description">Description</label>
    <input id="description" type="text" bind:value={description} />
  </div>
  <div>
    <button>Update</button>
  </div>
{:else}Loading{/if}
<div>
  <h2>Projects</h2>
  {#if loaded}
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {#each projects as project}
          <tr>
            <td>{project.name}</td>
            <td>Description here</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}Loading{/if}
</div>
<div>
  <h2>Members</h2>
  {#if loaded}
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Is admin</th>
        </tr>
      </thead>
      <tbody>
        {#each members as member}
          <tr>
            <td>{member.name}</td>
            <td>{member.email}</td>
            <td>{member.is_admin}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}Loading{/if}
</div>
