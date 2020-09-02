<script context="module">
  import { get } from "../../../../api";
  export async function preload({ params }, { user }) {
    if (user && user.jwt) {
      const reviews = await get(
        `/projects/${params.id}/reviews`,
        user && user.jwt
      );
      return { reviews };
    }
  }
</script>

<script>
  import StakeholderReview from "../../../../components/StakeholderReview.svelte";
  import SearchSortFilter from "../../../../components/SearchSortFilter.svelte";
  import { normalizeString } from "../../../../utils";
  export let reviews;

  let searchResults = [];

  const filters = [
    {
      label: "Review Status",
      options: ["pending", "accept", "requestChanges", "withdrawn"].map(
        (x) => ({
          label: normalizeString(x),
          value: x,
        })
      ),
      handler: (review, selectedOption) => selectedOption === review.status,
    },
  ];
</script>

<section class="contentWrapper">
  <h2>Stakeholder Reviews</h2>
  <p class="infoBlurb">
    Stakeholders can sign-off on groups of requirements that meet their
    expectations. They can also request changes to requirements.
  </p>
  <SearchSortFilter
    bind:searchResults
    list={reviews}
    {filters}
    sortKeyRecent="created_at"
    sortKeyAlpha="reviewedEntity.name"
    searchKeys={['reviewedEntity.name', 'reviewedEntity.requirements.description']} />
</section>
<section class="contentWrapper">
  {#each searchResults as review (review.id)}
    <StakeholderReview {review} />
  {/each}
</section>
