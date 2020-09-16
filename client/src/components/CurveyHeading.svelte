<script>
  export let minHeight = "20rem";
</script>

<style>
  div.curveyHeading {
    position: relative;
    background: var(--themeColor);
    background: radial-gradient(
      circle,
      var(--themeColor) 64%,
      rgba(53, 126, 98, 1) 100%
    );
    padding-bottom: 4.3rem;
  }

  div.curveyHeading .contentWrapper {
    color: white;
    display: flex;
    align-items: center;
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
    height: 5rem;
  }

  .custom-shape-divider-bottom .shape-fill {
    fill: var(--backdrop);
  }

  /** For mobile devices **/
  @media (max-width: 767px) {
    .custom-shape-divider-bottom svg {
      width: calc(100% + 1.3px);
      height: 4rem;
    }
  }
</style>

<div class="curveyHeading">
  <div
    class="contentWrapper"
    style={`
      min-height: ${minHeight};
    `}>
    <slot />
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
