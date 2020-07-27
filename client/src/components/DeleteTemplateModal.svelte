<script>
  import { del } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let template;
  export let update;
  export let close;

  $: deleteTemplate = async () => {
    await del(
      `/project-templates/${template.id}`,
      $session.user && $session.user.jwt
    );
    await update();
    close();
  };
</script>

<style>

</style>

<h3>Delete Template</h3>
<p>This action cannot be undone.</p>
<button class="button-danger" on:click={deleteTemplate}>Delete</button>
