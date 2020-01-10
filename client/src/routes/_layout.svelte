<script>
  import Nav from "../components/Nav.svelte";
</script>

<style>
  main {
    padding-top: 4.5rem;
  }
</style>

<Nav />

<main class="contentWrapper">
  <slot />
</main>
