<script>
  import { onMount } from "svelte";
  import { projectShouldUpdate } from "../../../stores.js";
  import { get } from "../../../api.js";
  import { stores } from "@sapper/app";

  import Reqgroup from "../../../components/Reqgroup.svelte";

  import { modalContent, modalProps } from "../../../stores.js";
  import AddBrGroupModal from "../../../components/AddBrGroupModal.svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  let reqgroups = get(
    `/projects/${id}/reqgroups?type=business`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    reqgroups = await get(
      `/projects/${id}/reqgroups?type=business`,
      $session.user && $session.user.jwt
    );
  };

  onMount(update);

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
{#await reqgroups}
  <!-- loading -->
{:then result}
  <section class="contentWrapper">
    {#each result as reqgroup (reqgroup.id)}
      <Reqgroup {reqgroup} {update} />
    {/each}
  </section>
{:catch error}
  <section class="contentWrapper">
    <p style="color: red">{error.message}</p>
  </section>
{/await}
