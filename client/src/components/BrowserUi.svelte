<style>
  .browserWrapper {
    perspective: 80rem;
    margin: 3rem 0;
    color: var(--normalText) !important;
    max-width: 45rem;
  }
  .browserUi {
    border: 0.1rem solid var(--borderColor);
    border-radius: 0.5rem;
    overflow: hidden;
    background-color: var(--background1);
    min-width: 40rem;
    width: 100%;
    padding: 0;
    padding-top: max(
      56.25%,
      18rem
    ) !important; /* maintains 16:9 aspect ratio */
    height: 0;
    transform: rotateY(-20deg) scale(0.95);
    box-shadow: 0.2rem 0.1rem 0.6rem 0 rgba(0, 0, 0, 0.1);
    transition: 0.2s ease;
    user-select: none;
    position: relative;
  }

  .browserUiContent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .slotContent {
    overflow-y: auto;
    padding: 0 1.5rem;
    height: calc(100% - 1.75rem);
  }

  .browserUi:hover {
    transform: unset !important;
    box-shadow: var(--boxShadow);
  }

  @media (max-width: 799px) {
    .browserUi {
      transform: unset !important;
      box-shadow: var(--boxShadow) !important;
      min-width: 25rem;
    }
  }

  .browserHeader {
    background-color: #eee;
    padding: 0 0.75rem;
    display: flex;
    align-items: center;
    height: 1.75rem;
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
    <div class="browserUiContent">
      <div class="browserHeader">
        <div class="browserButton close" />
        <div class="browserButton minimize" />
        <div class="browserButton maximize" />
      </div>
      <div class="slotContent">
        <slot />
      </div>
    </div>
  </div>
</div>
