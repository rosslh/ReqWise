<script context="module">
  export async function preload({ params }, { user }) {
    if (user && user.jwt) {
      const reqgroups = await get(
        `/projects/${params.id}/reqgroups?type=feature`,
        user && user.jwt
      );
      return { reqgroups };
    }
  }
</script>

<script>
  import { get } from "../../../api.js";
  import { normalizeString } from "../../../utils.js";
  import { projectShouldUpdate } from "../../../stores.js";
  import { stores } from "@sapper/app";

  import Reqgroup from "../../../components/Reqgroup.svelte";
  import AddFeature from "../../../components/AddFeature.svelte";
  import SearchSortFilter from "../../../components/SearchSortFilter.svelte";
  import { getContext } from "svelte";

  const { page, session } = stores();
  const { id } = $page.params;

  export let reqgroups;

  const scopes = getContext("scopes");

  const update = async () => {
    reqgroups = await get(
      `/projects/${id}/reqgroups?type=feature`,
      $session.user && $session.user.jwt
    );
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
      options: [
        "pending",
        "accepted",
        "requestChanges",
        "withdrawn",
      ].map((x) => ({ label: normalizeString(x), value: x })),
      selectedOption: undefined,
    },
  ];
</script>

<section class="contentWrapper">
  <h2>Features</h2>
  <p class="infoBlurb">
    A feature is a group of related requirements that allows the user to satisfy
    a high-level objective or need. <br /> Requirements tend to be more granular,
    and are written with implementation in mind.
  </p>
  {#if scopes.includes('member')}
    <AddFeature {update} {id} />
  {/if}
</section>
<section class="contentWrapper">
  <SearchSortFilter
    bind:searchResults
    list={reqgroups}
    {filters}
    searchKeys={['name', 'description', 'requirements.description']} />
  {#each searchResults.length ? searchResults : reqgroups as reqgroup (reqgroup.id)}
    <Reqgroup {reqgroup} {update} />
  {/each}
</section>
