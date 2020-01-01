<script>
  import { stores } from "@sapper/app";
  const { page } = stores();

  import Sidebar from "../../../components/Sidebar.svelte";
</script>

{JSON.stringify($page.params)}
<div class="container">
  <div class="row">
    <div class="column column-25">
      <Sidebar name={'Hello there'} />
    </div>
    <div class="column column-35">Content</div>
  </div>
</div>
