describe('Landing page', () => {
  beforeEach(() => {
    cy.visit('/')
  });

  it('has the correct headings', () => {
    cy.contains('h1', "An easier way for web developers and digital agencies to understand their clients' needs.");
    cy.contains('h2', "Brainstorm ideas with questionnaires");
    cy.contains('h2', "Collaborate with your team remotely");
    cy.contains('h2', "Organize and prioritize requirements");
    cy.contains('h2', "Attach designs and files");
    cy.contains('h2', "Receive feedback and approval from clients");
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
