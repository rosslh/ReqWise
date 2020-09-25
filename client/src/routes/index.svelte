<script>
  import BrowserUi from "../components/BrowserUi.svelte";
  import CurveyHeading from "../components/CurveyHeading.svelte";
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
  div.sloganSection .twoColumns {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    margin: 0 -1.5rem;
    padding: 4rem 0;
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
  <title>ReqWise | Understand your clients' needs</title>
</svelte:head>
<div class="sloganSection">
  <CurveyHeading minHeight="40rem">
    <div class="twoColumns">
      <div class="firstColumn">
        <h1 class="slogan">
          An easier way for digital agencies to understand their clients' needs.
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
  </CurveyHeading>
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
