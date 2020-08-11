<script context="module">
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
  import { get } from "../../../../api";
  export let reviews;
</script>

<section class="contentWrapper">
  <h2>Stakeholder Sign-Off</h2>
  <p class="infoBlurb">
    Stakeholders can sign-off on groups of requirements that meet their
    expectations. They can also request changes to requirements.
  </p>
</section>
<section class="contentWrapper">
  <pre>{JSON.stringify(reviews, null, 2)}</pre>
</section>
