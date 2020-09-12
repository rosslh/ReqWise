<script>
  import BrowserUi from "../components/BrowserUi.svelte";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import FaCheck from "svelte-icons/fa/FaCheck.svelte";
  import FaExclamation from "svelte-icons/fa/FaExclamation.svelte";

  let visibleReviews = [];

  onMount(() => {
    const reviews = [
      {
        message: "Feature #2 is approved",
        icon: FaCheck,
        bgColor: "var(--green)",
        fgColor: "white",
      },
      {
        message: "Quality attribute #4 is approved",
        icon: FaCheck,
        bgColor: "var(--green)",
        fgColor: "white",
      },
      {
        message: "Design #2 has changes requested",
        icon: FaExclamation,
        bgColor: "var(--background1)",
        fgColor: "var(--red)",
      },
    ];

    reviews.forEach((review, i) => {
      setTimeout(() => {
        visibleReviews = [...visibleReviews, review];
      }, i * 1500);
    });
  });
</script>

<style>
  div.sloganSection {
    background: var(--themeColor);
    background: radial-gradient(
      circle,
      var(--themeColor) 64%,
      rgba(53, 126, 98, 1) 100%
    );
    color: white;
    min-height: 40rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  div.sloganSection .twoColumns {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    margin: 0 -2rem;
  }

  div.sloganSection .twoColumns > * {
    width: 50%;
    min-width: 30rem;
    padding: 0 2rem;
  }

  p.slogan {
    font-size: 2.4rem;
    font-weight: 700;
    line-height: 4.5rem;
  }

  p.subtitle {
    font-size: 1.5rem;
  }

  .exampleReview {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 0;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 0.1rem solid var(--borderColor);
    background: var(--background2);
    font-weight: 500;
    font-size: 1.7rem;
  }

  .reviewIcon {
    display: inline-flex;
    height: 3rem;
    width: 3rem;
    overflow: hidden;
    border-radius: 50%;
    border: 0.1rem solid var(--borderColor);
    align-items: center;
    justify-content: center;
  }

  :global(.reviewIcon svg) {
    max-height: 1.5rem;
    max-width: 1.5rem;
  }
</style>

<svelte:head>
  <title>ReqWise | Requirements Management</title>
</svelte:head>
<div class="sloganSection">
  <div class="contentWrapper twoColumns">
    <div class="firstColumn">
      <p class="slogan">
        An easier way for digital agencies<br /> to understand their customer's needs.
      </p>
      <p class="subtitle">
        ReqWise allows teams to gather information about stakeholder needs,
        propose software requirements and designs, and seek approval from
        stakeholders.
      </p>
    </div>
    <div class="secondColumn">
      <BrowserUi>
        {#each visibleReviews as { message, icon, fgColor, bgColor }}
          <div class="exampleReview" in:fade>
            <div class="message">{message}</div>
            <div
              class="reviewIcon"
              style={`
              color: ${fgColor};
              background-color: ${bgColor};
            `}>
              <svelte:component this={icon} />
            </div>
          </div>
        {/each}
      </BrowserUi>
    </div>
  </div>
</div>
