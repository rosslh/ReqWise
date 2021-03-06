describe('Features page', () => {
  beforeEach(() => {
    cy.visit('/features')
  });

  it('has the correct headings', () => {
    cy.contains('h1', "Features");
    cy.contains('h2', "Brainstorm Ideas with Questionnaires");
    cy.contains('h2', "Collaborate Across Timezones and Geographies");
    cy.contains('h2', "Organize and Prioritize Requirements");
    cy.contains('h2', "Attach Designs, Files, and Diagrams");
    cy.contains('h2', "Receive Feedback and Approval from Clients");
    cy.contains('h2', "Integrate with Slack");
  });

  it('can navigate to login', () => {
    cy.get('[data-cy="loginLink"]').click();
    cy.url().should('include', 'login');
  });

  it('can navigate to signup', () => {
    cy.get('[data-cy="signupLink"]').click();
    cy.url().should('include', 'sign-up');
  });
});
