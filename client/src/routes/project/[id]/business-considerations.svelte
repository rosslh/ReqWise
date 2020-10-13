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
  import { onMount, getContext } from "svelte";
  import { projectShouldUpdate } from "../../../stores.js";
  import { get } from "../../../api.js";
  import normalizeString from "lodash/startCase";
  import { stores } from "@sapper/app";

  import SearchSortFilter from "../../../components/SearchSortFilter.svelte";
  import Reqgroup from "../../../components/Reqgroup.svelte";

  import { modalContent, modalProps } from "../../../stores.js";
  import AddBrGroupModal from "../../../components/AddBrGroupModal.svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  export let reqgroups;
  const scopes = getContext("scopes");

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

  const filters = [
    {
      label: "Review Status",
      options: ["draft", "pending", "accept", "requestChanges"].map((x) => ({
        label: normalizeString(x),
        value: x,
      })),
      handler: (reqgroup, selectedOption) =>
        (selectedOption === "draft" && reqgroup.is_draft) ||
        (!reqgroup.is_draft && selectedOption === reqgroup.latestReview.status),
    },
  ];
</script>

<section class="contentWrapper">
  <h2>Business Considerations</h2>
  <p class="infoBlurb">
    Business considerations describe the reason behind a project and what
    objectives of the organization will be fulfilled by undertaking the project.
  </p>
  {#if scopes.includes('member')}
    <button id="addReqGroupButton" on:click={showAddBrModal}>
      Add business consideration
    </button>
  {/if}
</section>
<section class="contentWrapper">
  <SearchSortFilter
    bind:searchResults
    {filters}
    list={reqgroups}
    searchKeys={['name', 'description', 'requirements.description']} />
  {#each searchResults as reqgroup (reqgroup.id)}
    <Reqgroup {reqgroup} {update} />
  {/each}
</section>
