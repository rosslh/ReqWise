describe('Landing page', () => {
  beforeEach(() => {
    cy.visit('/')
  });

  it('has the correct slogan', () => {
    cy.contains('p', "An easier way for digital agencies to understand their customer's needs.")
  });

  it('can navigate to login', () => {
    cy.get('#loginLink').click();
    cy.url().should('include', 'login');
  });

  // it('can navigate to signup', () => {
  //   cy.get('#signupLink').click();
  //   cy.url().should('include', 'sign-up');
  // });
});
