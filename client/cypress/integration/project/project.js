describe('Project page', () => {
  before(() => {
    cy.goToProject();
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('__session');
  });

  it('has the correct <h1>', () => {
    cy.contains('h1', "Test project");
  });

  it('redirects correctly', () => {
    cy.contains('h2', "Project dashboard");
  });
});
