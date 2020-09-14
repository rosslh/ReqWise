describe('Features page', () => {
  before(() => {
    cy.goToProject();
    cy.contains('a', "Brainstorm").click();
    cy.waitForPreload();
    cy.waitForSkeleton();
    cy.url().should('include', '/brainstorm');
    cy.contains('h2', "Brainstorm")
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('__session');
  });

  it('can add questionnaire', () => {
    cy.get('[data-cy="newQuestionnaire"]').click();
    cy.contains('h3', "Create questionnaire");
    cy.get('#title').click().type("New questionnaire");
    cy.get('#submitQuestionnaire').click();
    cy.waitForSpinner();
    cy.contains("h2", "New questionnaire");
  });

  it('can add prompt', () => {
    cy.get('[data-cy="addPrompt"]').click();
    cy.contains('h3', "Add prompt");
    cy.get('#prompt').click().type("New prompt");
    cy.get('#createPromptButton').click();
    cy.waitForSpinner();
    cy.contains("h3", "New prompt");
  });

  it('can publish questionnaire', () => {
    cy.get('[data-cy="questionnaireSettings"]').click();
    cy.contains('h3', "Questionnaire settings");
    cy.get('input#isDraft').click();
    cy.get('#saveQuestionnaire').click();
    cy.waitForSpinner();
    cy.get(".ribbon").should("not.exist");
  });

  it('can respond to questionnaire', () => {
    cy.get('[data-cy="toggleViewResponses"]').click();
    cy.get('input#responseText').click().type("New response");
    cy.get('#submitResponse').click();
    cy.waitForSpinner();
    cy.contains('[data-cy="textResponse"]', "New response");
  });

  it('can turn questionnaire into draft', () => {
    cy.get('[data-cy="questionnaireSettings"]').click();
    cy.contains('h3', "Questionnaire settings");
    cy.get('input#isDraft').click();
    cy.get('#saveQuestionnaire').click();
    cy.waitForSpinner();
    cy.contains(".ribbon", "Draft");
  });

  it('can delete prompt', () => {
    cy.get('[data-cy="deletePrompt"]').click();
    cy.contains('h3', "Delete questionnaire prompt");
    cy.get('#confirmDeletePrompt').click();
    cy.waitForSpinner();
    cy.get("h3").should("not.exist");
  });

});
