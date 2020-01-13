<script>
  import Nav from "../components/Nav.svelte";
</script>

<style>
  main {
    position: relative;
  }
</style>

<Nav />

<main>
  <slot />
</main>
