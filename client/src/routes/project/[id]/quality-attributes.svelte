<script context="module">
  export async function preload({ params }, { user }) {
    if (user && user.jwt) {
      const reqgroups = await get(
        `/projects/${params.id}/reqgroups?type=quality`,
        user && user.jwt
      );
      return { reqgroups };
    }
  }
</script>

<script>
  import { get } from "../../../api.js";
  import { normalizeString } from "../../../utils.js";
  import { stores } from "@sapper/app";
  import { getContext } from "svelte";

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

  const scopes = getContext("scopes");

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
  <h2>Quality Attributes</h2>
  <p class="infoBlurb">
    Quality attributes are measurable or testable properties of a system that
    are used to indicate how well the system satisfies the needs of its
    stakeholders.
  </p>
  <p class="infoBlurb">
    Examples of quality attributes include usability, maintainability,
    efficiency, and reliability.
  </p>
  {#if scopes.includes('member')}
    <button on:click={showAddQaModal}>Add quality attribute</button>
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
