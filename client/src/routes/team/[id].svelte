<script>
  import { onMount } from "svelte";
  import { modalContent, modalProps } from "../../stores.js";
  import { get, put, del } from "../../api.js";
  import { stores, goto } from "@sapper/app";
  const { page } = stores();

  import AddProjectModal from "../../components/AddProjectModal.svelte";
  import Skeleton from "../../components/Skeleton.svelte";

  let name = "";
  let description = "";

  let projects = null;
  let members = null;

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
        update();
      })
      .catch(() => alert("Failure"));
  };

  onMount(update);

  const deleteTeam = async () => {
    await del(`/teams/${id}`);
    goto("/teams");
  };
</script>

<div class="contentWrapper">
  {#if title}
    <h1>{title}</h1>
  {:else}
    <Skeleton inline />
  {/if}
  <section>
    {#if name || description}
      <fieldset>
        <label for="name">Team name</label>
        <input id="name" type="text" bind:value={name} />
      </fieldset>
      <fieldset>
        <label for="description">Description</label>
        <input id="description" type="text" bind:value={description} />
      </fieldset>
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
      <table class="compact">
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {#each projects as project (project.id)}
            <tr>
              <td>
                <a href={`/project/${project.id}`}>{project.name}</a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <Skeleton rows={2} />
    {/if}

    <div>
      <button
        class="button-create"
        on:click={() => {
          modalContent.set(AddProjectModal);
          modalProps.set({ id, update });
        }}>
        Create project
      </button>
    </div>
  </section>
  <section>
    <h2>Members</h2>
    {#if members}
      <table class="compact">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Is admin</th>
          </tr>
        </thead>
        <tbody>
          {#each members as member (member.id)}
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
      <button class="button-create">Add member</button>
    </div>
  </section>
  <section>
    <h2>Danger Zone</h2>
    <button class="button-danger" on:click={deleteTeam}>Delete team</button>
  </section>
</div>
