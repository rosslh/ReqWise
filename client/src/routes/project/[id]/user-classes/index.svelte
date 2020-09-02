<script>
  import { stores } from "@sapper/app";
  import { getContext } from "svelte";

  import { modalContent, modalProps } from "../../../../stores.js";
  import AddUserclassModal from "../../../../components/AddUserclassModal.svelte";
  import SearchSortFilter from "../../../../components/SearchSortFilter.svelte";
  import Userclass from "../../../../components/Userclass.svelte";
  import { get } from "../../../../api.js";
  import { normalizeString } from "../../../../utils.js";

  const { page, session } = stores();
  const { id } = $page.params;

  let userclasses = get(
    `/projects/${id}/userclasses`,
    $session.user && $session.user.jwt
  );

  const update = async () => {
    userclasses = await get(
      `/projects/${id}/userclasses`,
      $session.user && $session.user.jwt
    );
  };

  const addUserclass = async () => {
    modalContent.set(AddUserclassModal);
    modalProps.set({ id, update });
  };

  const scopes = getContext("scopes");

  let searchResults = [];

  const filters = [
    {
      label: "Review Status",
      options: [
        "draft",
        "pending",
        "accepted",
        "requestChanges",
        "withdrawn",
      ].map((x) => ({ label: normalizeString(x), value: x })),
      selectedOption: undefined,
    },
    {
      label: "Importance",
      options: ["favored", "disfavored", "ignored", "other"].map((x) => ({
        label: normalizeString(x),
        value: x,
      })),
      selectedOption: undefined,
    },
  ];
</script>

<section class="contentWrapper">
  <h2>User Classes</h2>
  <p class="infoBlurb">
    A user class is a group of users who have similar characteristics and
    requirements for the system.
  </p>
  {#if scopes.includes('member')}
    <button class="button button-success" on:click={addUserclass}>
      Add user class
    </button>
  {/if}
</section>
{#await userclasses}
  <!-- loading -->
{:then result}
  <section class="contentWrapper">
    <SearchSortFilter
      bind:searchResults
      {filters}
      list={result}
      searchKeys={['name', 'description', 'persona']} />
    {#each searchResults as userclass (userclass.id)}
      <Userclass {userclass} {update} projectId={id} />
    {/each}
  </section>
{:catch error}
  <section class="contentWrapper">
    <p style="color: var(--red)">{error.message}</p>
  </section>
{/await}
