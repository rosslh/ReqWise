describe('Features page', () => {
    beforeEach(() => {
        cy.goToProject();
    });

    it('can add feature', () => {
        cy.get("#addFeatureButton").click();
        cy.contains('h3', "Add a Feature");
        cy.get("#desc").click().type("New feature");
        cy.get("#addFeatureModalButton").click();
        cy.contains("h3", "New feature");
        cy.reload(); // ensure data is persisted
        cy.contains("h3", "New feature");
    });

    it('can add requirement', () => {
        cy.get(".addRequirementButton").first().click();
        cy.contains('h3', "Add a Requirement");
        cy.get("#desc").click().type("New requirement");
        cy.get("#submitRequirementButton").click();
        cy.contains("li.requirement div.desc", "New requirement");
        cy.reload(); // ensure data is persisted
        cy.contains("li.requirement div.desc", "New requirement");
    });

    it('can delete requirement', () => {
        cy.get("li.requirement", { force: true }).click();
        cy.get('#deleteRequirementButton').click();
        cy.get("#confirmReqDeleteButton").click();
        cy.get('li.requirement').should('not.exist');
        cy.reload(); // ensure deletion is persisted
        cy.get('li.requirement').should('not.exist');
    });

    it('can delete feature', () => {
        cy.get("button.deleteReqgroupButton").first().click();
        cy.get("button#confirmReqgroupDelete").click();
        cy.get('div.reqgroup').should('not.exist');
        cy.reload(); // ensure deletion is persisted
        cy.get('div.reqgroup').should('not.exist');
    });
});