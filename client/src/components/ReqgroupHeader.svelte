<script>
  import MdInfoOutline from "svelte-icons/md/MdInfoOutline.svelte";
  import { modalContent, modalProps } from "../stores.js";
  import ReqgroupDescriptionModal from "./ReqgroupDescriptionModal.svelte";
  import StakeholderStatus from "./StakeholderStatus.svelte";
  export let reqgroup;
  export let hideStakeholderStatus;
  export let reqgroupId;

  const showDescriptionModal = () => {
    modalContent.set(ReqgroupDescriptionModal);
    modalProps.set({ description: reqgroup.description, name: reqgroup.name });
  };
</script>

<style>
  div.reqgroupHeader {
    background-color: var(--background1);
    margin: -1.25rem -1.25rem 0 -1.25rem;
    padding: 1.25rem 1.5rem;
    border-bottom: 0.1rem solid var(--borderColor);
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

  div.reqgroupHeader h3 a {
    text-decoration: none;
    color: var(--normalText);
  }

  div.reqgroupHeader h3 a:hover {
    text-decoration: underline;
  }

  div.reqgroupHeader button {
    margin: 0;
    padding: 0;
    background: none;
    border: none;
    color: var(--secondaryText);
    width: 1.8rem;
    height: 1.8rem;
  }

  .reqgroupPpuid {
    color: var(--secondaryText);
    font-weight: 300;
    margin-left: 0.5rem;
  }
</style>

<div class="reqgroupHeader">
  <h3>
    <a
      rel="prefetch"
      href={`/project/${reqgroup.project_id}/reqgroup/${reqgroupId}`}>
      {reqgroup.name}
    </a>
    <span class="reqgroupPpuid">#{reqgroup.ppuid}</span>
  </h3>
  {#if !hideStakeholderStatus}
    <StakeholderStatus
      isDraft={reqgroup.is_draft}
      latestReviewStatus={reqgroup.latestReview && reqgroup.latestReview.status}
      latestReviewId={reqgroup.latestReview && reqgroup.latestReview.id} />
  {/if}
  {#if reqgroup.description}
    <button on:click={showDescriptionModal}>
      <MdInfoOutline />
    </button>
  {/if}
</div>
