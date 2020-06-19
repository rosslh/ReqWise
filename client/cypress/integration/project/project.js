describe('Project page', () => {
    beforeEach(() => {
        cy.goToProject();
    });

    it('has the correct <h1>', () => {
        cy.contains('h1', "Test project (don't delete)");
    });

    it('redirects correctly', () => {
        cy.contains('h2', "Features");
    });
});