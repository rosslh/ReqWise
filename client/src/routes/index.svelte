<script>
  import BrowserUi from "../components/BrowserUi.svelte";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import FaCheck from "svelte-icons/fa/FaCheck.svelte";
  import FaExclamation from "svelte-icons/fa/FaExclamation.svelte";
  import FaLightbulb from "svelte-icons/fa/FaLightbulb.svelte";
  import GoChecklist from "svelte-icons/go/GoChecklist.svelte";
  import FaFileAlt from "svelte-icons/fa/FaFileAlt.svelte";
  import FaEye from "svelte-icons/fa/FaEye.svelte";

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
      }, (i + 1) * 1000);
    });
  });

  const features = [
    {
      label: "Brainstorm ideas with questionnaires",
      href: "/features#brainstorm",
      icon: FaLightbulb,
    },
    {
      label: "Organize and prioritize requirements",
      href: "/features#organize",
      icon: GoChecklist,
    },
    {
      label: "Attach designs and files",
      href: "/features#documents",
      icon: FaFileAlt,
    },
    {
      label: "Receive feedback and approval from clients",
      href: "/features#reviews",
      icon: FaEye,
    },
  ];
</script>

<style>
  div.sloganSection {
    position: relative;
    background: var(--themeColor);
    background: radial-gradient(
      circle,
      var(--themeColor) 64%,
      rgba(53, 126, 98, 1) 100%
    );
  }

  div.sloganSection div.contentWrapper {
    color: white;
    min-height: 40rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  div.sloganSection div.contentWrapper .twoColumns {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    margin: 0 -1.5rem;
    padding: 4rem 0 7rem;
  }

  @media (max-width: 799px) {
    div.sloganSection .twoColumns > * {
      width: 100% !important;
    }

    div.exampleReview {
      padding: 0.75rem;
      margin: 0.75rem 0;
      font-size: 1.4rem;
    }

    .reviewIcon {
      height: 2.5rem;
      width: 2.5rem;
    }
  }

  div.sloganSection .twoColumns > * {
    width: 50%;
    min-width: 30rem;
    padding: 1.5rem;
  }

  div.secondColumn {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :global(div.secondColumn > *) {
    flex-grow: 1;
  }

  h1.slogan {
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
    font-size: 1.6rem;
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

  .custom-shape-divider-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;
    transform: rotate(180deg);
  }

  .custom-shape-divider-bottom svg {
    position: relative;
    display: block;
    width: calc(100% + 1.3px);
    height: 58px;
  }

  .custom-shape-divider-bottom .shape-fill {
    fill: var(--backdrop);
  }

  /** For mobile devices **/
  @media (max-width: 767px) {
    .custom-shape-divider-bottom svg {
      width: calc(100% + 1.3px);
      height: 43px;
    }
  }

  div.featureSection {
    margin: 3rem -1rem 0;
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
  }

  .featureWrapper {
    padding: 1rem;
    width: calc(50% - 2rem);
    margin: 2.5rem 1rem;
  }

  @media (max-width: 799px) {
    .featureWrapper {
      width: calc(100% - 2rem);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }

  .featureIcon {
    display: inline-flex;
    height: 4.5rem;
    width: 4.5rem;
    overflow: hidden;
    border-radius: 50%;
    border: 0.1rem solid var(--borderColor);
    align-items: center;
    justify-content: center;
    background-color: var(--green);
    color: white;
    box-shadow: var(--boxShadow);
  }

  :global(.featureIcon svg) {
    max-height: 2.35rem;
    max-width: 2.35rem;
  }

  h2.featureLabel {
    font-size: 1.8rem;
    font-weight: 600;
    margin-top: 1.75rem;
  }
</style>

<svelte:head>
  <title>ReqWise | Requirements Management</title>
</svelte:head>
<div class="sloganSection">
  <div class="contentWrapper">
    <div class="twoColumns">
      <div class="firstColumn">
        <h1 class="slogan">
          An easier way for digital agencies to understand their customer's
          needs.
        </h1>
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
  <div class="custom-shape-divider-bottom">
    <svg
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none">
      <path
        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
        class="shape-fill" />
    </svg>
  </div>
</div>
<section class="contentWrapper">
  <div class="featureSection">
    {#each features as { icon, label, href }}
      <div class="featureWrapper">
        <div class="featureIcon">
          <svelte:component this={icon} />
        </div>
        <h2 class="featureLabel">{label}</h2>
        <a rel="prefetch" {href}>Learn more &rsaquo;</a>
      </div>
    {/each}
  </div>
</section>
