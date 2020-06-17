<script context="module">
  export async function preload(page, session) {
    if (!session.user) {
      return this.redirect(
        302,
        `/login?redirect=${encodeURIComponent(page.path)}`
      );
    }
    return { reqId: page.params.reqId };
  }
</script>

<script>
  export let reqId;
  import ViewRequirementModal from "../../../../../components/ViewRequirementModal.svelte";
</script>

<section class="contentWrapper">
  <ViewRequirementModal isPrioritized={true} id={reqId} />
</section>
