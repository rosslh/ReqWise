<script context="module">
  export async function preload(_, { user }) {
    if (user) {
      return this.redirect(302, `/account`);
    }
  }
</script>

<slot />
