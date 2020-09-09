<script>
  export let scopes = [];
</script>

<style>
  .userFlair {
    background-color: var(--grey1);
    border-radius: 0.5rem;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 1.4rem;
    padding: 0 0.5rem;
    height: 2.2rem;
    margin: 0 1rem;
  }
</style>

<span class="userFlair">
  {#if scopes.includes('owner')}
    Team owner
  {:else if scopes.includes('admin')}
    Team administrator
  {:else if scopes.includes('member')}Team member{:else}Stakeholder{/if}
</span>
