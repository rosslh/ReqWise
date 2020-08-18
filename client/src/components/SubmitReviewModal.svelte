<script>
  import { stores } from "@sapper/app";

  export let id;
  export let update;
  export let close;

  import SubmitButton from "./SubmitButton.svelte";
  import { put } from "../api";

  let comment = "";
  let status;

  const { session } = stores();

  const submit = async () => {
    if (status && comment) {
      await put(
        `/reviews/${id}`,
        { comment, status },
        $session.user && $session.user.jwt
      );
      await update();
      close();
    } else {
      alert("Please leave a review before submitting.");
    }
  };
</script>

<style>
  fieldset {
    display: flex;
    align-items: flex-start;
  }

  input[type="radio"] {
    margin-top: 1rem;
  }

  label.label-inline {
    margin-left: 0.75rem;
    font-weight: 600;
  }

  label .secondary {
    font-weight: 400;
    color: var(--secondaryText);
  }
</style>

<h3>Submit review</h3>
<form>
  <textarea bind:value={comment} placeholder="Leave a comment" />
  <fieldset>
    <input
      bind:group={status}
      type="radio"
      id="accept"
      name="type"
      value="accept" />
    <label class="label-inline" for="accept">
      Approve
      <br />
      <span class="secondary">
        Submit feedback and approve these requirements.
      </span>
    </label>
  </fieldset>
  <fieldset>
    <input
      bind:group={status}
      type="radio"
      id="requestChanges"
      name="type"
      value="requestChanges" />
    <label class="label-inline" for="requestChanges">
      Request changes
      <br />
      <span class="secondary">
        Submit feedback that must be addressed before accepting.
      </span>
    </label>
  </fieldset>
  <SubmitButton handler={submit}>Submit review</SubmitButton>
</form>
