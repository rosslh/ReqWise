<script>
  import Nav from "../components/Nav.svelte";
</script>

<style>
  main {
    padding-top: 3rem;
  }
</style>

<Nav />

<main class="contentWrapper">
  <slot />
</main>
