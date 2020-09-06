<script>
  export let label = "";
  export let bgColor = "var(--secondaryText)";
  export let backdropColor = "var(--background1)";
  export let width = "6rem";
</script>

<style>
  .ribbon {
    position: relative;
    height: 5.5rem;
    width: var(--stakeholderStatusWidth);
    margin-top: -1.25rem;
    color: var(--background1);
    font-size: 1.2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    text-transform: capitalize;
    text-align: center;
    line-height: 1.4rem;
  }

  .bottomTriangle {
    position: absolute;
    bottom: 0;
    width: 0;
    height: 0;
    border-left: calc(var(--stakeholderStatusWidth) / 2) solid transparent;
    border-right: calc(var(--stakeholderStatusWidth) / 2) solid transparent;
  }
</style>

<div
  data-cy={label}
  style={`
  background-color: ${bgColor};
  --stakeholderStatusWidth: ${width};
`}
  class="ribbon">
  {label}
  <div
    class="bottomTriangle"
    aria-hidden={true}
    style={`
    border-bottom: 1rem solid ${backdropColor};
    `} />
</div>
