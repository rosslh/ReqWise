<style>
  .browserWrapper {
    perspective: 80rem;
    margin: 3rem 0;
  }
  .browserUi {
    border: 0.1rem solid var(--borderColor);
    border-radius: 0.5rem;
    overflow: hidden;
    padding: 0.5rem;
    background-color: var(--background1);
    width: 44.444rem;
    height: 25rem;
    transform: rotateY(-20deg) scale(0.9);
  }

  .browserHeader {
    background-color: #eee;
    margin: -0.5rem -0.5rem 0;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  .browserWrapper .browserButton {
    height: 1rem;
    width: 1rem;
    border-radius: 50%;
    margin-right: 0.5rem;
    opacity: 0.8;
  }

  .browserWrapper .browserButton.close {
    background-color: var(--red);
  }

  .browserWrapper .browserButton.minimize {
    background-color: var(--orange);
  }

  .browserWrapper .browserButton.maximize {
    background-color: var(--green);
  }
</style>

<div class="browserWrapper">
  <div class="browserUi">
    <div class="browserHeader">
      <div class="browserButton close" />
      <div class="browserButton minimize" />
      <div class="browserButton maximize" />
    </div>
    <slot />
  </div>
</div>
