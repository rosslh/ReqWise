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
  export let reviews;
</script>

<section class="contentWrapper">
  <h2>Stakeholder Reviews</h2>
  <p class="infoBlurb">
    Stakeholders can sign-off on groups of requirements that meet their
    expectations. They can also request changes to requirements.
  </p>
</section>
<section class="contentWrapper">
  {#each reviews as review (review.id)}
    <StakeholderReview {review} />
  {/each}
</section>
