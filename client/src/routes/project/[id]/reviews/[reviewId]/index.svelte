<script>
  import { get } from "../../../../../api.js";
  import { stores } from "@sapper/app";

  import StakeholderReview from "../../../../../components/StakeholderReview.svelte";

  const { page, session } = stores();
  const { reviewId } = $page.params;

  let review = get(`/reviews/${reviewId}`, $session.user && $session.user.jwt);
</script>

<style>
  section {
    margin-top: 2rem;
  }
</style>

<section class="contentWrapper">
  {#await review}
    <!-- loading -->
  {:then result}
    <StakeholderReview review={result} />
  {:catch error}
    <p style="color: var(--red)">{error.message}</p>
  {/await}
</section>
