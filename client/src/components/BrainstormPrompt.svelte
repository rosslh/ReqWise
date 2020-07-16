<script>
  export let update;
  export let prompt;
  export let isDraft = false;
  export let isOpen = true;

  let responses = prompt.responses;

  import { modalContent, modalProps } from "../stores.js";
  import DeletePromptModal from "./DeletePromptModal.svelte";
  import AddBrainstormResponse from "./AddBrainstormResponse.svelte";
  import PromptResponses from "./PromptResponses.svelte";
  // import { get } from "../api.js";

  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  // import { stores } from "@sapper/app";
  // const { session } = stores();

  const deletePrompt = () => {
    modalContent.set(DeletePromptModal);
    modalProps.set({
      prompt,
      update
    });
  };

  // const updateResponses = async () => {
  //   responses = await get(
  //     `/prompts/${prompt.id}/responses`,
  //     $session.user && $session.user
  //   );
  // };

  const capitalizeFirstLetter = str =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const getType = () => {
    if (prompt.responseType === "likert") {
      return "Likert scale";
    } else {
      return capitalizeFirstLetter(prompt.responseType);
    }
  };

  let viewResponses = prompt.hasResponded;

  const toggleView = () => {
    viewResponses = !viewResponses;
  };
</script>

<style>
  .promptWrapper {
    box-shadow: var(--boxShadow);
    border-radius: 0.8rem;
    margin: 2rem 0;
    background-color: var(--background1);
    overflow: hidden;
  }

  div.promptHeader {
    padding: 2rem 2rem 0;
    display: flex;
    justify-content: space-between;
  }

  div.promptWrapper .right {
    color: var(--secondaryText);
    font-size: 1.4rem;
  }

  div.promptHeader h3 {
    margin: 0;
    font-size: 1.8rem;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem 2rem;
  }
  .footer button,
  .footer .button {
    margin: 0;
  }
</style>

<div class="promptWrapper">
  <div class="promptHeader">
    <div class="left">
      <h3>{prompt.prompt}</h3>
    </div>
    <div class="right">{getType()}</div>
  </div>
  {#if viewResponses}
    <PromptResponses {responses} />
  {:else}
    <AddBrainstormResponse {prompt} {isDraft} {isOpen} />
  {/if}
  <div class="footer">
    <div class="left">
      <button
        class="button button-secondary button-small button-outline"
        on:click={toggleView}>
        {#if viewResponses}Add response{:else}View responses{/if}
      </button>
    </div>
    <div class="right">
      <button
        on:click={deletePrompt}
        class="button-outline button-small button-secondary button-clear">
        <div class="iconWrapper">
          <FaRegTrashAlt />
        </div>
        Delete
      </button>
    </div>
  </div>
</div>
