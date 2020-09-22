describe('Brainstorm page', () => {
  before(() => {
    cy.goToProject();
    cy.contains('a', "Brainstorm").click();
    cy.waitForPreload();
    cy.waitForSkeleton();
    cy.url().should('include', '/brainstorm');
    cy.contains('h2', "Brainstorm")
  });

  const goToQuestionnaireAsOwner = () => {
    cy.goToProject("test.owner@reqwise.com", "1234");
    cy.contains('a', "Brainstorm").click();
    cy.waitForPreload();
    cy.waitForSkeleton();
    cy.url().should('include', '/brainstorm');
    cy.contains('h2', "Brainstorm")
    cy.contains('a', "New questionnaire").click();
    cy.waitForPreload();
    cy.waitForSkeleton();
    cy.url().should('include', 'brainstorm/forms/');
    cy.contains('h2', "New questionnaire")
  };

  let publicUrl;

  const goToQuestionnaireAsStakeholder = (email, pwd) => {
    cy.login(email, pwd);
    cy.visit('/account');
    cy.get('a[data-cy="feedbackRequest"]').click();
    cy.waitForPreload();
    cy.waitForSkeleton();
    cy.url().should('include', 'public-form/');
    cy.url().then(url => { publicUrl = url });
    cy.contains("h1", "New questionnaire");
  };

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

  it('can add prompts', () => {
    cy.get('[data-cy="addPrompt"]').click();
    cy.contains('h3', "Add prompt");
    cy.get('#prompt').click().type("New prompt");
    cy.get('#createPromptButton').click();
    cy.waitForSpinner();
    cy.contains("h3", "New prompt");

    cy.get('[data-cy="addPrompt"]').click();
    cy.contains('h3', "Add prompt");
    cy.get('#prompt').click().type("Second prompt");
    cy.get('#createPromptButton').click();
    cy.waitForSpinner();
    cy.contains("h3", "Second prompt");
  });

  it('can publish questionnaire', () => {
    cy.get('[data-cy="questionnaireSettings"]').click();
    cy.contains('h3', "Questionnaire settings");
    cy.get('input#isDraft').click();
    cy.get('input#isPublic').click();
    cy.get('#saveQuestionnaire').click();
    cy.waitForSpinner();
    cy.get(".ribbon").should("not.exist");
  });

  it('can respond to questionnaire', () => {
    cy.get('[data-cy="toggleViewResponses"]').first().click();
    cy.get('input#responseText').click().type("New response");
    cy.get('#submitResponse').click();
    cy.waitForSpinner();
    cy.contains('[data-cy="textResponse"]', "New response");
  });

  it('can share with existing user', () => {
    cy.get('button[data-cy="shareQuestionnaire"]').click();
    cy.contains("h3", "Share with Stakeholder");
    cy.get('button[data-cy="toggleShowForm"]').click();
    cy.get("#inviteeEmail").click().type("test.stakeholder@reqwise.com"); // test.stakeholder account already exists (see seed script)
    cy.get("#saveQuestionnaire").click();
    cy.waitForSpinner();
    goToQuestionnaireAsStakeholder("test.stakeholder@reqwise.com", "1234");
  });

  it('can share with new user', () => {
    goToQuestionnaireAsOwner();
    cy.get('button[data-cy="shareQuestionnaire"]').click();
    cy.contains("h3", "Share with Stakeholder");
    cy.get('button[data-cy="toggleShowForm"]').click();
    cy.get("#inviteeEmail").click().type("test.new@reqwise.com"); // test.new doesn't exist yet (see seed script)
    cy.get("#saveQuestionnaire").click();
    cy.waitForSpinner();
    cy.signUp("test.new@reqwise.com", "1234");
    goToQuestionnaireAsStakeholder("test.new@reqwise.com", "1234");
  });

  it('existing user can respond to public questionnaire', () => {
    goToQuestionnaireAsStakeholder("test.stakeholder@reqwise.com", "1234");
    cy.get('[data-cy="toggleViewResponses"]').first().click();
    cy.get('input#responseText').click().type("Existing stakeholder response 1");
    cy.get('#submitResponse').click();
    cy.waitForSpinner();
    cy.contains('[data-cy="textResponse"]', "Existing stakeholder response 1");
  });

  it('new user can respond to public questionnaire', () => {
    goToQuestionnaireAsStakeholder("test.new@reqwise.com", "1234");
    cy.get('[data-cy="toggleViewResponses"]').first().click();
    cy.get('input#responseText').click().type("New stakeholder response 1");
    cy.get('#submitResponse').click();
    cy.waitForSpinner();
    cy.contains('[data-cy="textResponse"]', "New stakeholder response 1");
  });

  it('can make questionnaire private', () => {
    goToQuestionnaireAsOwner();
    cy.get('[data-cy="questionnaireSettings"]').click();
    cy.contains('h3', "Questionnaire settings");
    cy.get('input#isPublic').click();
    cy.get('#saveQuestionnaire').click();
    cy.waitForSpinner();
    cy.get('[data-cy="viewPublic"]').should("not.exist");
  });

  it('existing user can respond to private questionnaire', () => {
    goToQuestionnaireAsStakeholder("test.stakeholder@reqwise.com", "1234");
    cy.get('[data-cy="toggleViewResponses"]').click();
    cy.get('input#responseText').click().type("Existing stakeholder response 2");
    cy.get('#submitResponse').click();
    cy.waitForSpinner();
    cy.contains('[data-cy="textResponse"]', "Existing stakeholder response 2");
  });

  it('new user can respond to private questionnaire', () => {
    goToQuestionnaireAsStakeholder("test.new@reqwise.com", "1234");
    cy.get('[data-cy="toggleViewResponses"]').click();
    cy.get('input#responseText').click().type("New stakeholder response 2");
    cy.get('#submitResponse').click();
    cy.waitForSpinner();
    cy.contains('[data-cy="textResponse"]', "New stakeholder response 2");
  });

  it('anonymous user cannot see private questionnaire', () => {
    cy.clearCookie('__session');
    cy.clearCookies();
    cy.reload();
    cy.visit(publicUrl);
    cy.get('h1[data-cy="questionnaireTitle"]').should("not.exist");
  });

  it('can make questionnaire public', () => {
    goToQuestionnaireAsOwner();
    cy.get('[data-cy="questionnaireSettings"]').click();
    cy.contains('h3', "Questionnaire settings");
    cy.get('input#isPublic').click();
    cy.get('#saveQuestionnaire').click();
    cy.waitForSpinner();
    cy.contains('[data-cy="viewPublic"]', "View public");
  });

  it('anonymous user can see public questionnaire', () => {
    cy.clearCookie('__session');
    cy.clearCookies();
    cy.reload();
    cy.visit(publicUrl);
    cy.contains('h1', 'New questionnaire');
  });

  it('can turn questionnaire into draft', () => {
    goToQuestionnaireAsOwner();
    cy.get('[data-cy="questionnaireSettings"]').click();
    cy.contains('h3', "Questionnaire settings");
    cy.get('input#isDraft').click();
    cy.get('#saveQuestionnaire').click();
    cy.waitForSpinner();
    cy.contains(".ribbon", "Draft");
  });

  it('can delete prompts', () => {
    cy.get('[data-cy="deletePrompt"]').first().click();
    cy.contains('h3', "Delete questionnaire prompt");
    cy.get('#confirmDeletePrompt').click();
    cy.waitForSpinner();
    cy.get('[data-cy="deletePrompt"]').click();
    cy.contains('h3', "Delete questionnaire prompt");
    cy.get('#confirmDeletePrompt').click();
    cy.waitForSpinner();
    cy.get("h3").should("not.exist");
  });
});
