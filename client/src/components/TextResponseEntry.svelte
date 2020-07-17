<script>
  import FaCheckCircle from "svelte-icons/fa/FaCheckCircle.svelte";
  import FaThumbsUp from "svelte-icons/fa/FaThumbsUp.svelte";
  import FaThumbsDown from "svelte-icons/fa/FaThumbsDown.svelte";

  import { del, post } from "../api.js";
  import { stores } from "@sapper/app";
  const { session } = stores();

  export let response;
  export let update;

  $: didUpvote =
    response.yourReaction && response.yourReaction.reactionType === "upvote";
  $: didDownvote =
    response.yourReaction && response.yourReaction.reactionType === "downvote";

  const upvote = async () => {
    if (response.yourReaction) {
      await del(
        `/reactions/${response.yourReaction.id}`,
        $session.user && $session.user.jwt
      );
    }
    if (!didUpvote) {
      await post(
        `/responses/${response.id}/reactions`,
        {
          reactionType: "upvote"
        },
        $session.user && $session.user.jwt
      );
    }
    await update();
  };

  const downvote = async () => {
    if (response.yourReaction) {
      await del(
        `/reactions/${response.yourReaction.id}`,
        $session.user && $session.user.jwt
      );
    }
    if (!didDownvote) {
      await post(
        `/responses/${response.id}/reactions`,
        {
          reactionType: "downvote"
        },
        $session.user && $session.user.jwt
      );
    }
    await update();
  };
</script>

<style>
  .barWrapper {
    max-width: 45rem;
    display: flex;
    align-items: center;
    height: 4rem;
    border-radius: 0.8rem;
    border: 0.1rem solid var(--borderColor);
    margin: 1rem 0.5rem 0;
    position: relative;
    background-color: var(--background1);
    overflow: hidden;
  }

  .barWrapper > *:not(.responseBar) {
    z-index: 3;
    padding: 0 2rem;
  }

  .responseSelected {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-grow: 1;
  }

  .responseIcon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.8rem;
  }

  :global(.responseIcon svg) {
    max-height: 1.8rem;
    max-width: 1.8rem;
  }

  button.reactButton {
    border: none;
    border-radius: 0.8rem;
    height: 2.8rem;
    min-width: 2.8rem;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.25rem 0.5rem;
    margin: 0;
    background-color: var(--backdrop);
    color: var(--secondaryText);
  }

  .reactIcon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    margin-right: 0.75rem;
    /* box-sizing: border-box; */
  }

  :global(.reactIcon svg) {
    max-height: 1.5rem;
    max-width: 1.5rem;
  }

  div.react {
    display: flex;
  }

  div.react > button:first-child {
    margin-right: 0.75rem;
  }

  .thumbsDown {
    transform: translateY(0.2rem);
  }

  .reactButton.selected {
    color: white !important;
    background: var(--themeColor) !important;
  }
</style>

<div class="barWrapper">
  <div class="responseValue">"{response.textResponse}"</div>
  <div class="react">
    <button
      on:click={upvote}
      class={`reactButton ${didUpvote ? 'selected' : ''}`}>
      <div class="reactIcon">
        <FaThumbsUp />
      </div>
      <div class="reactCount">{response.upvotes}</div>
    </button>
    <button
      on:click={downvote}
      class={`reactButton ${didDownvote ? 'selected' : ''}`}>
      <div class="reactIcon thumbsDown">
        <FaThumbsDown />
      </div>
      <div class="reactCount">{response.downvotes}</div>
    </button>
  </div>
  <div class="responseSelected">
    {#if response.selectedByYou}
      <div class="responseIcon">
        <FaCheckCircle />
      </div>
    {/if}
  </div>
</div>
