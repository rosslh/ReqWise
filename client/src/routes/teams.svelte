<script>
  import { onMount } from "svelte";
  import { userId } from "../stores.js";
  import { get, post } from "../api.js";

  let teams = [];

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

<style>
  td,
  th {
    padding: 0.5rem 1rem;
    text-align: left;
  }

  table {
    margin-bottom: 2rem;
  }

  div.teamDetails {
    display: flex;
    flex-direction: column;
  }

  div.inputWrapper {
    margin: 0.3rem 0;
  }

  div.inputWrapper label {
    display: block;
    padding: 0.3rem 0;
  }

  div.buttonWrapper {
    margin-top: 0.6rem;
  }
</style>

<h1>My Teams</h1>

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
