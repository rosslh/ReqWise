<script>
  import FaEdit from "svelte-icons/fa/FaEdit.svelte";
  import FaArchive from "svelte-icons/fa/FaArchive.svelte";
  import FaExchangeAlt from "svelte-icons/fa/FaExchangeAlt.svelte";
  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";

  export let selectedReqs;
</script>

<style>
  .rotate90 {
    transform: rotate(90deg);
  }

  div.selectTools {
    height: 8.5rem;
    max-height: 8.5rem;
    transition: all 0.1s linear;
    background-color: var(--offwhite1);
    border-bottom: 0.1rem solid var(--grey1);
    margin: 0 -1.5rem;
    padding: 0 1.5rem;
    opacity: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  div.selectTools > div.selectToolsLabel {
    margin-bottom: 1rem;
    height: 2.5rem;
    font-weight: 600;
  }
  div.selectTools > div.buttons {
    display: flex;
    align-items: center;
  }

  div.selectTools > div.buttons > * {
    margin-right: 0.5rem;
    margin-top: 0;
  }
  div.selectTools.hidden {
    transform: scaleY(0%);
    max-height: 0;
    opacity: 0;
  }
</style>

<div class={`selectTools ${selectedReqs.length ? '' : 'hidden'}`}>
  <div class="selectToolsLabel">
    {selectedReqs.length} selected requirement{selectedReqs.length === 1 ? '' : 's'}:
  </div>
  <div class="buttons">
    <button class="button-small">
      <div class="iconWrapper rotate90">
        <FaExchangeAlt />
      </div>
      Move to feature
    </button>
    <button class="button-small">
      <div class="iconWrapper">
        <FaEdit />
      </div>
      Change status
    </button>
    <button class="button-small button-caution">
      <div class="iconWrapper">
        <FaArchive />
      </div>
      Archive
    </button>
    <button class="button-small button-danger">
      <div class="iconWrapper">
        <FaRegTrashAlt />
      </div>
      Delete
    </button>
  </div>
</div>
