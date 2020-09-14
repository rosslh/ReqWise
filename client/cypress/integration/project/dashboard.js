describe('Dashboard page', () => {
  before(() => {
    cy.goToProject();
    cy.contains('a', "Dashboard").click();
    cy.waitForPreload();
    cy.waitForSkeleton();
    cy.url().should('include', '/dashboard');
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('__session');
  });

  it('has the correct headings', () => {
    cy.contains('h2', "Project dashboard");
    cy.contains('h3', "Summary");
    cy.contains('h3', "Reviews");
    cy.contains('h3', "Activity");
  });

  it('has the correct summary', () => {
    cy.contains('li', "1 Requirement");
    cy.contains('li', "1 Feature");
    cy.contains('li', "0 Files");
    cy.contains('li', "0 User classes");
  });

  it('has the correct review counts', () => {
    cy.contains('li', "0 Pending");
    cy.contains('li', "0 Accepted");
    cy.contains('li', "0 Changes Requested");
    cy.contains('li', "0 Withdrawn");
  });
});
