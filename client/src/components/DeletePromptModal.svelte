<script>
  import { del } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let prompt;
  export let update;
  export let close;

  import SubmitButton from "./SubmitButton.svelte";

  $: deletePrompt = async () => {
    await del(`/prompts/${prompt.id}`, $session.user && $session.user.jwt);
    await update();
    close();
  };
</script>

<style>
</style>

<h3>Delete questionnaire prompt</h3>
<p>This action cannot be undone.</p>
<SubmitButton
  id="confirmDeletePrompt"
  className="button-danger"
  handler={deletePrompt}>
  Delete
</SubmitButton>
