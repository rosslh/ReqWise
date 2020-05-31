<script context="module">
  import { setLoginParam } from "../utils.js";
  export async function preload(page, { user }) {
    setLoginParam(page, user, this.redirect);
  }
</script>

<style>
  p.first {
    font-size: 2.5rem;
  }

  p {
    font-size: 2rem;
  }
</style>

<svelte:head>
  <title>ReqWise | Requirements Management</title>
</svelte:head>
<div class="contentWrapper">
  <h1>ReqWise</h1>
  <p class="first">The next-gen requirements management tool.</p>
  <p>Coming Summer 2020.</p>
</div>
