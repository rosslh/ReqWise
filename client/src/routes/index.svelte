<script>
  import BrowserUi from "../components/BrowserUi.svelte";
</script>

<style>
  div.sloganSection {
    background-color: var(--background2);
  }

  div.sloganSection .twoColumns {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  p.firstColumn {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 6rem;
  }
</style>

<svelte:head>
  <title>ReqWise | Requirements Management</title>
</svelte:head>
<div class="sloganSection">
  <div class="contentWrapper twoColumns">
    <p class="firstColumn">
      An easier way for digital agencies<br /> to understand their customer's needs.
    </p>
    <div class="secondColumn">
      <BrowserUi>Lmao</BrowserUi>
    </div>
  </div>
</div>
<div class="contentWrapper">Features</div>
