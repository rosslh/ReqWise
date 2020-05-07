<script context="module">
  export async function preload({ params }, { user }) {
    const { id } = params;
    const reqgroups = await get(
      `/projects/${id}/reqgroups?type=business`,
      user && user.jwt
    );
    return { reqgroups };
  }
</script>

<script>
  import { onMount } from "svelte";
  import { projectShouldUpdate } from "../../../stores.js";
  import { get, post } from "../../../api.js";
  import { stores } from "@sapper/app";

  import Reqgroup from "../../../components/Reqgroup.svelte";

  import { modalContent, modalProps } from "../../../stores.js";
  import AddBrGroupModal from "../../../components/AddBrGroupModal.svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  export let reqgroups = [];

  const update = async () => {
    reqgroups = await get(
      `/projects/${id}/reqgroups?type=business`,
      $session.user && $session.user.jwt
    );
  };

  const showAddBrModal = async () => {
    modalContent.set(AddBrGroupModal);
    modalProps.set({ id, update });
  };

  $: updateFromStream =
    $projectShouldUpdate &&
    (() => {
      update();
      $projectShouldUpdate = false;
    })();
</script>

<section class="contentWrapper">
  <h2>Business Requirements</h2>
  <p class="infoBlurb">
    Business requirements describe the reason behind a project and what
    objectives of the organization will be fulfilled by undertaking the project.
  </p>
  <button on:click={showAddBrModal}>Add requirement group</button>
</section>
{#if reqgroups.length}
  <section class="contentWrapper">
    {#each reqgroups as reqgroup (reqgroup.id)}
      <Reqgroup {reqgroup} {update} />
    {/each}
  </section>
{/if}
