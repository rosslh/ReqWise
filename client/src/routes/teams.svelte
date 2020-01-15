<script>
  import { onMount } from "svelte";
  import { userId } from "../stores.js";
  import { get, post } from "../api.js";
  import Modal from "../components/Modal.svelte";
  import Skeleton from "../components/Skeleton.svelte";
  let teams = null;

  const update = async () => {
    teams = await get(`/users/${$userId}/teams`);
  };

  onMount(update);

  let isModalShown = false;
  let teamName = "";
  let teamDesc = "";

  const submitNewTeam = async () => {
    await post(`/teams`, { name: teamName, description: teamDesc });
    await update();
  };
</script>

<div class="contentWrapper">
  <h1>My Teams</h1>
  {#if teams}
    <table class="compact">
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
  {#if isModalShown}
    <Modal bind:isModalShown>
      <fieldset>
        <label for="teamName">Team name</label>
        <input type="text" bind:value={teamName} />
      </fieldset>
      <fieldset>
        <label for="teamDesc">Description</label>
        <textarea bind:value={teamDesc} />
      </fieldset>
      <fieldset>
        <button class="button-create" on:click={submitNewTeam}>Create</button>
      </fieldset>
    </Modal>
  {:else}
    <button
      class="button-create"
      on:click={() => {
        isModalShown = true;
      }}>
      Create team
    </button>
  {/if}
</div>
