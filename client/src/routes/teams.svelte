<script>
  import { onMount } from "svelte";
  import { userId } from "../stores.js";
  import { get, post } from "../api.js";
  import Skeleton from "../components/Skeleton.svelte";
  let teams = null;

  const update = async () => {
    teams = await get(`/users/${$userId}/teams`);
  };

  onMount(update);

  let createTeam = false;
  let teamName = "";
  let teamDesc = "";

  const submitNewTeam = async () => {
    await post(`/teams`, { name: teamName, description: teamDesc });
    await update();
  };
</script>

<h1>My Teams</h1>

{#if teams}
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      {#each teams as team}
        <tr>
          <td>
            <a href={`/team/${team.id}`}>{team.name}</a>
          </td>
          <td>{team.description}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <Skeleton rows={3} />
{/if}
{#if createTeam}
  <div class="teamDetails">
    <div class="inputWrapper">
      <label for="teamName">Team name</label>
      <input type="text" bind:value={teamName} />
    </div>
    <div class="inputWrapper">
      <label for="teamDesc">Description</label>
      <textarea bind:value={teamDesc} />
    </div>
    <div class="buttonWrapper">
      <button on:click={submitNewTeam}>Create</button>
      <button
        on:click={() => {
          createTeam = false;
        }}>
        Cancel
      </button>
    </div>
  </div>
{:else}
  <button
    on:click={() => {
      createTeam = true;
    }}>
    Create team
  </button>
{/if}
