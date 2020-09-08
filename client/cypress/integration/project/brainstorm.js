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

  it('can delete prompt', () => {
    cy.get('[data-cy="deletePrompt"]').click();
    cy.contains('h3', "Delete questionnaire prompt");
    cy.get('#confirmDeletePrompt').click();
    cy.waitForSpinner();
    cy.get("h3").should("not.exist");
  });

});
