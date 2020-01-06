<script>
  import { onMount } from "svelte";
  import { get, post, put } from "../../api.js";
  import { stores } from "@sapper/app";
  const { page } = stores();

  import Skeleton from "../../components/Skeleton.svelte";

  let name = "";
  let description = "";

  let projects = null;
  let members = null;

  let createProject = false;
  let newProjectName = "";

  const { id } = $page.params;

  let title = "";

  const update = async () => {
    get(`/teams/${id}`).then(r => {
      ({ name, description } = r);
      title = name;
    });
    get(`/teams/${id}/projects`).then(r => {
      projects = r;
    });
    get(`/teams/${id}/members`).then(r => {
      members = r;
    });
  };

  const updateTeam = async () => {
    await put(`/teams/${id}`, { name, description })
      .then(() => {
        alert("Success");
        update();
      })
      .catch(() => alert("Failure"));
  };

  onMount(update);

  const submitNewProject = async () => {
    await post(`/teams/${id}/projects`, { name: newProjectName });
    await update();
  };
</script>

{#if title}
  <h1>{title}</h1>
{:else}
  <Skeleton inline />
{/if}
<section>
  {#if name || description}
    <div>
      <label for="name">Team name</label>
      <input id="name" type="text" bind:value={name} />
    </div>
    <div>
      <label for="description">Description</label>
      <input id="description" type="text" bind:value={description} />
    </div>
  {:else}
    <Skeleton rows={2} />
  {/if}
  <div>
    <button on:click={updateTeam}>Update</button>
  </div>
</section>
<section>
  <h2>Projects</h2>
  {#if projects}
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
  {:else}
    <Skeleton rows={2} />
  {/if}
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
    <div>
      <button
        on:click={() => {
          createProject = true;
        }}>
        Create project
      </button>
    </div>
  {/if}
</section>
<section>
  <h2>Members</h2>
  {#if members}
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
  {:else}
    <Skeleton rows={3} />
  {/if}
  <div>
    <button>Add member</button>
  </div>
</section>
