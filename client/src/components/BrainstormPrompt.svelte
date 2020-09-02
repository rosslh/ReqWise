<script>
  export let update;
  export let prompt;
  export let isDraft = false;
  export let isOpen = true;
  export let unlinkRequirement;
  export let unlinkReqgroup;

  import { modalContent, modalProps } from "../stores.js";
  import DeletePromptModal from "./DeletePromptModal.svelte";
  import AddBrainstormResponse from "./AddBrainstormResponse.svelte";
  import PromptResponses from "./PromptResponses.svelte";
  import { get, del } from "../api.js";
  import normalizeString from "lodash/startcase";

  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaLink from "svelte-icons/fa/FaLink.svelte";
  import FaUnlink from "svelte-icons/fa/FaUnlink.svelte";
  import { stores } from "@sapper/app";
  const { session, page } = stores();

  const deletePrompt = () => {
    modalContent.set(DeletePromptModal);
    modalProps.set({
      prompt,
      update,
    });
  };

  const updateResponses = async () => {
    prompt = await get(
      `/prompts/${prompt.id}`,
      $session.user && $session.user.jwt
    );
  };

  $: responses = prompt.responses;

  const getType = () => {
    if (prompt.responseType === "likert") {
      return "Likert scale";
    } else {
      return normalizeString(prompt.responseType);
    }
  };

  let viewResponses = !prompt.is_open || prompt.yourResponse;

  const toggleView = () => {
    viewResponses = !viewResponses;
  };

  const unlinkPrompt = async () => {
    if (unlinkRequirement) {
      await del(
        `/prompts/${prompt.id}/requirements/${unlinkRequirement}`,
        $session.user && $session.user.jwt
      );
    } else {
      await del(
        `/prompts/${prompt.id}/reqgroups/${unlinkReqgroup}`,
        $session.user && $session.user.jwt
      );
    }
    await update();
  };
</script>

<style>
  .promptWrapper {
    box-shadow: var(--boxShadow);
    border-radius: 0.5rem;
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

  .secondary {
    color: var(--secondaryText);
    text-align: center;
    padding: 2rem;
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
    {#if responses.length}
      <PromptResponses {prompt} {responses} update={updateResponses} />
    {:else}
      <div class="secondary">No responses yet</div>
    {/if}
  {:else}
    <AddBrainstormResponse
      {prompt}
      {isDraft}
      {isOpen}
      {toggleView}
      update={updateResponses} />
  {/if}
  <div class="footer">
    <div class="left">
      {#if !viewResponses || !prompt.yourResponse}
        <button
          class="button button-secondary button-small button-outline"
          on:click={toggleView}>
          {#if viewResponses}Add response{:else}View responses{/if}
        </button>
      {/if}
    </div>
    <div class="right">
      {#if $session.user && $session.user.jwt}
        {#if unlinkRequirement || unlinkReqgroup}
          <button
            on:click={unlinkPrompt}
            class="button-outline button-small button-secondary button-clear">
            <div class="iconWrapper iconWrapper-padded">
              <FaUnlink />
            </div>
            Unlink prompt
          </button>
        {:else}
          <a
            rel="prefetch"
            href={`/project/${$page.params.id}/brainstorm/prompts/${prompt.id}/requirements`}
            class="button button-outline button-small button-secondary
              button-clear">
            <div class="iconWrapper iconWrapper-padded">
              <FaLink />
            </div>
            Requirements
          </a>
        {/if}
        {#if isDraft}
          <button
            on:click={deletePrompt}
            class="button-outline button-small button-secondary button-clear">
            <div class="iconWrapper">
              <FaRegTrashAlt />
            </div>
            Delete
          </button>
        {/if}
      {/if}
    </div>
  </div>
</div>
