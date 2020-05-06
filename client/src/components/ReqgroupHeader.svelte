<script>
  import MdInfoOutline from "svelte-icons/md/MdInfoOutline.svelte";
  import { modalContent, modalProps } from "../stores.js";
  import ReqgroupDescriptionModal from "../components/ReqgroupDescriptionModal.svelte";
  export let reqgroup;

  const showDescriptionModal = () => {
    modalContent.set(ReqgroupDescriptionModal);
    modalProps.set({ description: reqgroup.description, name: reqgroup.name });
  };
</script>

<style>
  div.reqgroupHeader {
    background-color: var(--offwhite1);
    margin: -1.2rem -1.2rem 0 -1.2rem;
    padding: 1.8rem 1.2rem;
    border-bottom: 0.1rem solid var(--grey1);
    min-height: 5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  div.reqgroupHeader h3 {
    font-size: 1.8rem;
    display: inline;
    margin: 0;
    max-width: 50%;
    /* color: #333; */
  }

  div.reqgroupHeader button {
    margin: 0;
    padding: 0;
    background: none;
    border: none;
    color: var(--grey4);
    width: 1.8rem;
    height: 1.8rem;
  }

  .reqgroupPpuid {
    color: var(--grey4);
    margin-left: 0.5rem;
  }
</style>

<div class="reqgroupHeader">
  <h3>
    {reqgroup.name}
    <span class="reqgroupPpuid">#{reqgroup.ppuid}</span>
  </h3>
  {#if reqgroup.description}
    <button on:click={showDescriptionModal}>
      <MdInfoOutline />
    </button>
  {/if}
</div>
