describe('Features page', () => {
  beforeEach(() => {
    cy.visit('/features')
  });

  it('has the correct headings', () => {
    cy.contains('h1', "Features");
    cy.contains('h2', "Brainstorm Ideas with Questionnaires");
    cy.contains('h2', "Organize and Prioritize Requirements");
    cy.contains('h2', "Attach Designs, Files, and Diagrams");
    cy.contains('h2', "Receive Feedback and Approval from Clients");
  });

  it('can navigate to login', () => {
    cy.get('#loginLink').click();
    cy.url().should('include', 'login');
  });

  it('can navigate to signup', () => {
    cy.get('#signupLink').click();
    cy.url().should('include', 'sign-up');
  });
});
