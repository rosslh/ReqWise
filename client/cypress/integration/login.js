describe('Login page', () => {
    beforeEach(() => {
        cy.visit('/login')
    });

    it('has the correct <h1>', () => {
        cy.contains('h1', 'Sign in to ReqWise')
    });

    it('can login', () => {
        cy.login();
        cy.url().should('include', '/account');
    });
});