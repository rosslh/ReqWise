describe('Requirement page', () => {
    before(() => {
        cy.goToRequirement();
    });

    beforeEach(() => {
        Cypress.Cookies.preserveOnce('__session');
    });

    it('can load', () => {
    })
});