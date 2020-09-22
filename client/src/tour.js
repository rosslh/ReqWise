export const startProductTour = () => {
  import("driver.js").then(({ default: Driver }) => {
    const driver = new Driver();
    driver.highlight('[data-driver="navbar"]');
  });
};
