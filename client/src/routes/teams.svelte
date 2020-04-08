<script>
  import { onMount } from "svelte";
  import { userId, modalContent, modalProps } from "../stores.js";
  import { get, post } from "../api.js";
  import Skeleton from "../components/Skeleton.svelte";
  import AddTeamModal from "../components/AddTeamModal.svelte";
  let teams = null;

  const update = async () => {
    teams = await get(`/users/${$userId}/teams`);
  };

  onMount(update);
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
        {#each teams as team (team.id)}
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

  <button
    class="button-create"
    on:click={() => {
      modalContent.set(AddTeamModal);
      modalProps.set({ update });
    }}>
    Create team
  </button>
</div>
