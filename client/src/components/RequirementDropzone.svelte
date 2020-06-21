<script>
  export let hiddenPlaceholders;
  export let parentId;
  export let depth = 0;
</script>

<style lang="scss">
  @for $i from 0 through 10 {
    li.requirement.depth-#{$i} {
      transform: translateX(3rem * $i);
      margin-right: 3rem * $i;
    }

    .nestedPlaceholder.depth-#{$i} {
      left: 1rem + 3rem * $i;
      width: calc(95% - (2rem + 3rem * #{$i}));
    }
  }

  .nestedPlaceholder {
    visibility: hidden;
    height: 2.25rem;
    padding: 0;
    margin: -1rem 0 -1.25rem;
    transition: height 0.2s ease;
    border-radius: 0.4rem;
    position: relative;
    box-sizing: content-box;
    background-clip: padding-box;
    &:hover,
    &.hover {
      height: 4.5rem;
      opacity: 1;
      background-color: var(--backdrop);
      border: 1rem solid transparent;
    }
  }
</style>

<li
  data-parentid={parentId}
  data-isplaceholder={1}
  class={`nestedPlaceholder draggable depth-${depth} ${hiddenPlaceholders.includes(parentId) ? 'hidden' : ''}`} />
