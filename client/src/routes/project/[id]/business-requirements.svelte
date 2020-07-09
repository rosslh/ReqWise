<script context="module">
  export async function preload({ params }, { user }) {
    if (user && user.jwt) {
      const reqgroups = await get(
        `/projects/${params.id}/reqgroups?type=business`,
        user && user.jwt
      );
      return { reqgroups };
    }
  }
</script>

<script>
  import { onMount } from "svelte";
  import { projectShouldUpdate } from "../../../stores.js";
  import { get } from "../../../api.js";
  import { stores } from "@sapper/app";

  import SearchSortFilter from "../../../components/SearchSortFilter.svelte";
  import Reqgroup from "../../../components/Reqgroup.svelte";

  import { modalContent, modalProps } from "../../../stores.js";
  import AddBrGroupModal from "../../../components/AddBrGroupModal.svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  export let reqgroups;

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

  let searchResults = [];
</script>

<section class="contentWrapper">
  <h2>Business Requirements</h2>
  <p class="infoBlurb">
    Business requirements describe the reason behind a project and what
    objectives of the organization will be fulfilled by undertaking the project.
  </p>
  <button id="addReqGroupButton" on:click={showAddBrModal}>
    Add requirement group
  </button>
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
