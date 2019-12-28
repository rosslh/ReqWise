<script>
  import { onMount } from "svelte";
  import { get, post } from "../../api.js";

  import { stores } from "@sapper/app";
  const { page } = stores();

  let name = "";
  let description = "";

  let projects = [];
  let members = [];

  let createProject = false;
  let newProjectName = "";

  let loaded = false;

  const { id } = $page.params;

  const update = async () => {
    ({ name, description } = await get(`/teams/${id}`));
    projects = await get(`/teams/${id}/projects`);
    members = await get(`/teams/${id}/members`);
    loaded = true;
  };

  onMount(update);

  const submitNewProject = async () => {
    await post(`/teams/${id}/projects`, { name: newProjectName });
    await update();
  };
</script>

<style lang="scss">
  // $red: #ff0000;
  // div {
  //   label {
  //     color: $red;
  //   }
  // }
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
            <td>
              <a href={`/project/${project.id}`}>{project.name}</a>
            </td>
            <td>Description here</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}Loading{/if}
</div>
{#if createProject}
  <div class="projectDetails">
    <div class="inputWrapper">
      <label for="projectName">Project name</label>
      <input type="text" bind:value={newProjectName} />
    </div>
    <div class="buttonWrapper">
      <button on:click={submitNewProject}>Create</button>
      <button
        on:click={() => {
          createProject = false;
        }}>
        Cancel
      </button>
    </div>
  </div>
{:else}
  <button
    on:click={() => {
      createProject = true;
    }}>
    Create project
  </button>
{/if}
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
