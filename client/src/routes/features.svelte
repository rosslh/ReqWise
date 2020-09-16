<script>
  import CurveyHeading from "../components/CurveyHeading.svelte";

  const features = [
    {
      title: "Brainstorm Ideas with Questionnaires",
      subtitle:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      slug: "brainstorm",
    },
    {
      title: "Organize and Prioritize Requirements",
      subtitle:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      slug: "organize",
    },
    {
      title: "Attach Designs, Files, and Diagrams",
      subtitle:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      slug: "documents",
    },
    {
      title: "Receive Feedback and Approval from Clients",
      subtitle:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      slug: "reviews",
    },
  ];
</script>

<style>
  .feature {
    display: flex;
    align-items: center;
    padding: 6rem 0;
    margin: 0 -1.25rem;
  }

  .feature .textColumn {
    width: 33.3%;
    padding: 1.25rem;
  }

  .feature .imageColumn {
    width: 66.6%;
    padding: 1.25rem;
    perspective: 80rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  @media (max-width: 799px) {
    .feature {
      flex-wrap: wrap;
    }
    .feature .textColumn,
    .feature .imageColumn {
      width: 100%;
      text-align: center;
    }

    .feature .imageColumn {
      justify-content: center !important;
    }

    .feature .imageColumn img {
      transform: unset !important;
    }
  }

  .feature .imageColumn img {
    box-shadow: var(--boxShadowLarge);
    border-radius: 0.5rem;
    border: 0.1rem solid var(--borderColor);
    width: calc(100% - 1rem); /* adds some padding */
  }

  .feature .featureTitle {
    font-size: 2.25rem;
    margin-top: 0;
  }
  .feature .subtitle {
    color: var(--secondaryText);
    font-size: 1.5rem;
  }
</style>

<CurveyHeading>
  <h1>Features</h1>
</CurveyHeading>
<section class="contentWrapper featureSection">
  {#each features as { title, subtitle, slug }, i}
    <div
      id={slug}
      class="feature"
      style={`
      flex-direction: ${i % 2 ? 'row-reverse' : 'row'};
    `}>
      <div class="textColumn">
        <h2 class="featureTitle">{title}</h2>
        <p class="subtitle">{subtitle}</p>
        <a href="/sign-up/invite" class="button button-small">Try now for free</a>
      </div>
      <div
        class="imageColumn"
        style={`
        flex-direction: ${i % 2 ? 'row-reverse' : 'row'};
      `}>
        <img
          src={`features/${slug}.png`}
          alt={title}
          style={`
          ${i % 2 ? 'transform: rotateY(10deg);' : 'transform: rotateY(-10deg);'}
          `} />
      </div>
    </div>
  {/each}
</section>
