<script>
  import { stores } from "@sapper/app";
  const { page } = stores();
</script>

<div class="contentWrapper">
  <div class="backLink">
    <a rel="prefetch" href={`/project/${$page.params.id}/sign-off`}>
      &larr;&nbsp;View all reviews
    </a>
  </div>
</div>
<slot />
