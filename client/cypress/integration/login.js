describe('Login page', () => {
    beforeEach(() => {
        cy.visit('/login')
    });

    it('has the correct <h1>', () => {
        cy.contains('h1', 'Log in')
    });

    it('can login', () => {
        cy.login();
        cy.url().should('include', 'teams');
    });
});