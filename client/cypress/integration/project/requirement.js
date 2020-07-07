describe('Requirement page', () => {
    before(() => {
        cy.goToRequirement();
    });

    beforeEach(() => {
        Cypress.Cookies.preserveOnce('__session');
    });

    it('can add comment', () => {
        cy.get('#editor .ql-editor').click().type("Test comment");
        cy.get("#postCommentButton").click();
        cy.wait(2500);
        cy.contains(".commentContent", "Test comment");
    });

    it('can delete comment', () => {
        cy.get(".deleteWrapper button").click();
        cy.get(".commentWrapper").should("not.exist");
    });
});