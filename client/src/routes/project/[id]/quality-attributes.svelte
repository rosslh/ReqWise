<script>
  import { onMount } from "svelte";
  import { get, post } from "../../../api.js";
  import { stores } from "@sapper/app";

  import Reqgroup from "../../../components/Reqgroup.svelte";
  import { projectShouldUpdate } from "../../../stores.js";
  import Spinner from "../../../components/Spinner.svelte";

  import { modalContent, modalProps } from "../../../stores.js";
  import AddQaGroupModal from "../../../components/AddQaGroupModal.svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  let reqgroups = get(
    `/projects/${id}/reqgroups?type=quality`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    reqgroups = await get(
      `/projects/${id}/reqgroups?type=quality`,
      $session.user && $session.user.jwt
    );
  };

  const showAddQaModal = async () => {
    modalContent.set(AddQaGroupModal);
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
  <h2>Quality Attributes</h2>
  <p class="infoBlurb">
    Quality attributes are measurable or testable properties of a system that
    are used to indicate how well the system satisfies the needs of its
    stakeholders.
  </p>
  <p class="infoBlurb">
    Types of quality attributes include usability, maintainability, efficiency,
    and reliability.
  </p>
  <button on:click={showAddQaModal}>Add quality attribute</button>
</section>
{#await reqgroups}
  <section class="contentWrapper">
    <Spinner />
  </section>
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
