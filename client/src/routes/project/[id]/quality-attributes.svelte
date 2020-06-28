<script context="module">
  export async function preload({ params }, { user }) {
    const reqgroups = await get(
      `/projects/${params.id}/reqgroups?type=quality`,
      user && user.jwt
    );
    return { reqgroups };
  }
</script>

<script>
  import { get } from "../../../api.js";
  import { stores } from "@sapper/app";

  import SearchSortFilter from "../../../components/SearchSortFilter.svelte";
  import Reqgroup from "../../../components/Reqgroup.svelte";
  import { projectShouldUpdate } from "../../../stores.js";

  import { modalContent, modalProps } from "../../../stores.js";
  import AddQaGroupModal from "../../../components/AddQaGroupModal.svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  export let reqgroups;

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

  let searchResults = [];
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
<section class="contentWrapper">
  <SearchSortFilter
    bind:searchResults
    list={reqgroups}
    searchKeys={['name', 'description', 'requirements.description']} />
  {#each searchResults.length ? searchResults : reqgroups as reqgroup (reqgroup.id)}
    <Reqgroup {reqgroup} {update} />
  {/each}
</section>
