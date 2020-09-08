import 'cypress-wait-until';

Cypress.Commands.add("login", (email = "test.owner@reqwise.com", password = "1234") => {
  cy.clearCookie('__session');
  cy.clearCookies();
  cy.reload();
  cy.waitForPreload();
  cy.url().should('include', '/login');
  cy.wait(1500);
  cy.get("#email").click().type(email);
  cy.get("#pwd").click().type(password);
  cy.get(".submitButton").click();
  cy.waitForSpinner();
  cy.waitForPreload();
  cy.url().should('not.include', 'login');
});

Cypress.Commands.add("goToProject", (email = "test.owner@reqwise.com", password = "1234") => {
  cy.visit('/account')
  cy.login(email, password);
  if (!email.includes("stakeholder")) {
    cy.contains('a', "Test team").click();
    cy.waitForPreload();
    cy.waitForSkeleton();
    cy.url().should('include', 'team/');
    cy.contains("h1", "Test team");
  }
  cy.contains('a', "Test project").click();
  cy.waitForPreload();
  cy.waitForSkeleton();
  cy.url().should('include', 'project/');
  cy.contains('h1', "Test project")
});

Cypress.Commands.add("goToRequirement", () => {
  cy.visit('/account')
  cy.login();
  cy.waitForPreload();
  cy.waitForSkeleton();
  cy.contains('a', "Test team").click();
  cy.waitForPreload();
  cy.waitForSkeleton();
  cy.url().should('include', 'team/');
  cy.contains("h1", "Test team");
  cy.contains('a', "Test project").click();
  cy.waitForPreload();
  cy.waitForSkeleton();
  cy.url().should('include', 'project/');
  cy.contains('h1', "Test project")
  cy.contains('a', "Test feature").click();
  cy.waitForPreload();
  cy.waitForSkeleton();
  cy.url().should('include', 'reqgroup/');
  cy.contains('h2', "View feature")
  cy.get('button[data-cy=commentIconWrapper]').click();
  cy.waitForPreload();
  cy.waitForSkeleton();
  cy.url().should('include', 'requirement/');
  cy.contains('h2', "View requirement");
});

Cypress.Commands.add("waitForSpinner", () => cy.waitUntil(() => !Cypress.$('.loadingSpinner').length, { timeout: 30000, interval: 500 }));

Cypress.Commands.add("waitForSkeleton", () => cy.waitUntil(() => !Cypress.$('.skeletonWrapper').length, { timeout: 30000, interval: 500 }));

Cypress.Commands.add("waitForPreload", () => cy.waitUntil(() => !Cypress.$('main#preloading').length, { timeout: 30000, interval: 500 }));
