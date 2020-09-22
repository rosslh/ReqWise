describe('Project features page', () => {
  before(() => {
    cy.goToProject();
    cy.contains('a', "Features").click();
    cy.waitForPreload();
    cy.waitForSkeleton();
    cy.url().should('include', '/features');
    cy.contains('h2', "Features")
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('__session');
  });

  it('can add feature', () => {
    cy.get('#addFeatureButton').click();
    cy.contains('h3', "Add a Feature");
    cy.get('#desc').click().type("New feature");
    cy.get('#addFeatureModalButton').click();
    cy.waitForSpinner();
    cy.contains("h3", "New feature");
  });

  it('can edit feature', () => {
    cy.get('#editReqgroupButton[data-reqgroup="New feature"]').click();
    cy.contains('h3', "Update feature");
    cy.get('#desc').click().clear().type("Updated feature");
    cy.get('#updateReqgroupButton').click();
    cy.waitForSpinner();
    cy.contains("h3", "Updated feature");
  });

  it('can add requirement', () => {
    cy.get('.addRequirementButton[data-reqgroup="Updated feature"]').first().click();
    cy.contains('h3', "Add a Requirement");
    cy.get('#desc').click().type("New requirement");
    cy.get('#submitRequirementButton').click();
    cy.waitForSpinner();
    cy.contains("li.requirement div.desc", "New requirement");
  });

  it('can change requirement status', () => {
    cy.get('li.requirement[data-reqdesc="New requirement"]').click();
    cy.contains("#changeRequirementStatusButton", "status");
    cy.get('#changeRequirementStatusButton').click();
    cy.get('.statusSelectWrapper .selectContainer').click();
    cy.get('.statusSelectWrapper .selectContainer .listItem').eq(1).click();
    cy.get('input#rationale').click().type("test rationale");
    cy.get('#changeStatusSubmitButton').click();
    cy.waitForSpinner();
    cy.contains("li.requirement span.statusText", "Accepted", { matchCase: false });
  });

  it('can change requirement priority', () => {
    cy.get('li.requirement[data-reqdesc="New requirement"]').click();
    cy.contains("#changeRequirementPriorityButton", "priority");
    cy.get('#changeRequirementPriorityButton').click();
    cy.get('.prioritySelectWrapper .selectContainer').click();
    cy.get('.prioritySelectWrapper .selectContainer .listItem').eq(2).click();
    cy.get('input#rationale').click().type("test rationale");
    cy.get('#changePrioritySubmitButton').click();
    cy.waitForSpinner();
    cy.contains("li.requirement div.priority", "Low", { matchCase: false });
  });

  it('can add second requirement', () => {
    cy.get('.addRequirementButton[data-reqgroup="Updated feature"]').first().click();
    cy.contains('h3', "Add a Requirement");
    cy.get('#desc').click().type("Nested requirement");
    cy.get('#submitRequirementButton').click();
    cy.waitForSpinner();
    cy.contains("li.requirement.depth-0 div.desc", "Nested requirement");
  });

  it('can nest requirement', () => { // TODO: make this less flakey
    const dataTransfer = new DataTransfer();
    cy.get('.requirement[data-reqdesc="Nested requirement"]')
      .find('.reqHandle')
      .invoke('show')
      .invoke('attr', 'style', 'visibility: visible')
      .should('be.visible')
      .trigger('mousedown', { button: 0 })
      .trigger('dragstart', { dataTransfer });

    cy.waitUntil(() => Cypress.$('.nestedPlaceholder.depth-1').length);

    cy.get('.reqWrapper[data-reqgroup="Updated feature"] .nestedPlaceholder.depth-1').eq(0)
      .trigger('mousemove')
      .trigger('mouseover')
      .trigger('dragover', {
        dataTransfer
      })
      .trigger('drop', { dataTransfer })
      .trigger('mouseup', { button: 0 });

    cy.waitUntil(() => Cypress.$('li.requirement.depth-1').length);

    cy.contains("li.requirement.depth-1 div.desc", "Nested requirement");
  });

  it('can delete requirement', () => {
    cy.get('li.requirement', { force: true }).eq(1).click();
    cy.get('#deleteRequirementButton').click();
    cy.get('#confirmReqDeleteButton').click();
    cy.get('li.requirement[data-reqdesc="Nested requirement"] div.desc').should('have.length', 1);
  });

  it('can delete feature', () => {
    cy.get('button.deleteReqgroupButton[data-reqgroup="Updated feature"]').first().click();
    cy.get('button#confirmReqgroupDelete').click();
    cy.get('div.reqgroup').should('have.length', 1);
  });
});
