import 'cypress-wait-until';

Cypress.Commands.add("login", () => {
    cy.get("#email").click().type('test@reqwise.com');
    cy.get("#pwd").click().type('1234');
    cy.get(".submitButton").click();
    cy.waitForSpinner();
    cy.url().should('not.include', 'login');
});

Cypress.Commands.add("goToProject", () => {
    cy.visit('/teams')
    cy.login();
    cy.waitForSkeleton();
    cy.contains('a', "Test team (don't delete)").click();
    cy.url().should('include', 'team/');
    cy.waitForSkeleton();
    cy.contains('a', "Test project (don't delete)").click();
    cy.url().should('include', 'project/');
    cy.contains('h1', "Test project (don't delete)")
});

Cypress.Commands.add("waitForSpinner", () => cy.waitUntil(() => !Cypress.$('.loadingSpinner').length, { timeout: 30000, interval: 500 }));

Cypress.Commands.add("waitForSkeleton", () => cy.waitUntil(() => !Cypress.$('.skeletonWrapper').length, { timeout: 30000, interval: 500 }));