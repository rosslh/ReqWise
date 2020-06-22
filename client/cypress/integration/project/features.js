describe('Features page', () => {
    before(() => {
        cy.goToProject();
    });

    beforeEach(() => {
        Cypress.Cookies.preserveOnce('__session');
    });

    it('can add feature', () => {
        cy.get("#addFeatureButton").click();
        cy.contains('h3', "Add a Feature");
        cy.get("#desc").click().type("New feature");
        cy.get("#addFeatureModalButton").click();
        cy.contains("h3", "New feature");
    });

    it('can add requirement', () => {
        cy.get(".addRequirementButton").first().click();
        cy.contains('h3', "Add a Requirement");
        cy.get("#desc").click().type("New requirement");
        cy.get("#submitRequirementButton").click();
        cy.contains("li.requirement div.desc", "New requirement");
    });

    it('can change requirement status and priority', () => {
        cy.get("li.requirement", { force: true }).click();
        cy.get('#changeRequirementStatusButton').click();
        cy.get(".statusSelectWrapper .selectContainer").click();
        cy.get(".statusSelectWrapper .selectContainer .listItem").eq(1).click();
        cy.get("input#rationale").click().type("test rationale");
        cy.get("#changeStatusSubmitButton").click();
        cy.contains("li.requirement span.statusText", "Accepted", { matchCase: false });

        cy.get("li.requirement", { force: true }).click();
        cy.get('#changeRequirementPriorityButton').click();
        cy.get(".prioritySelectWrapper .selectContainer").click();
        cy.get(".prioritySelectWrapper .selectContainer .listItem").eq(2).click();
        cy.get("input#rationale").click().type("test rationale");
        cy.get("#changePrioritySubmitButton").click();
        cy.contains("li.requirement div.priority", "Low", { matchCase: false });
    });

    it('can add nested requirement', () => {
        cy.get(".addRequirementButton").first().click();
        cy.contains('h3', "Add a Requirement");
        cy.get("#desc").click().type("Nested requirement");
        cy.get("#submitRequirementButton").click();
        cy.contains("li.requirement.depth-0 div.desc", "Nested requirement");

        const dataTransfer = new DataTransfer();
        cy.get('.reqHandle').eq(1).invoke('show').invoke('attr', 'style', 'visibility: visible').should('be.visible');
        cy.get('.reqHandle').eq(1)
            .trigger('mousedown', { button: 0 })
            .trigger('dragstart', { dataTransfer });

        cy.waitUntil(() => Cypress.$('.nestedPlaceholder.depth-1').length);

        cy.get('.nestedPlaceholder.depth-1').eq(0)
            .trigger('mousemove')
            .trigger('mouseover')
            .trigger('dragover', {
                dataTransfer
            })
            .trigger('drop', { dataTransfer })
            .trigger('mouseup', { button: 0 });

        cy.contains("li.requirement.depth-1 div.desc", "Nested requirement");
    });

    it('can delete requirement', () => {
        cy.get("li.requirement", { force: true }).eq(1).click();
        cy.get('#deleteRequirementButton').click();
        cy.get("#confirmReqDeleteButton").click();
        cy.get('li.requirement div.desc').should('have.length', 1);
    });

    it('can delete feature', () => {
        cy.get("button.deleteReqgroupButton").first().click();
        cy.get("button#confirmReqgroupDelete").click();
        cy.get('div.reqgroup').should('not.exist');
    });
});