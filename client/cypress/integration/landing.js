describe('Landing page', () => {
    beforeEach(() => {
        cy.visit('/')
    });

    it('has the correct <h1>', () => {
        cy.contains('h1', 'ReqWise')
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