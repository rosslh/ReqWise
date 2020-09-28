<script context="module">
  export async function preload(_, { user }) {
    if (user) {
      return this.redirect(302, `/account`);
    }
  }
</script>

<script>
  import Helmet from "../../components/Helmet.svelte";
</script>

<Helmet title="Sign Up - ReqWise" />
<slot />
