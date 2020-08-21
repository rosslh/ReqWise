<script context="module">
  import { get } from "../../../../api";
  export async function preload({ params }, { user }) {
    if (user && user.jwt) {
      const reqgroups = await get(
        `/projects/${params.id}/baselines`,
        user && user.jwt
      );
      return { reqgroups };
    }
  }
</script>

<script>
  export let reqgroups;
</script>

<section class="contentWrapper">
  <h2>Requirements Baseline</h2>
  <p class="infoBlurb">
    A requirements baseline is a snapshot in time that represents a reviewed and
    approved set of requirements. A new baseline is automatically created when a
    stakeholder approves a requirement group, file, or userclass.
  </p>
</section>
<section class="contentWrapper">
  <pre>{JSON.stringify(reqgroups, null, 2)}</pre>
</section>
