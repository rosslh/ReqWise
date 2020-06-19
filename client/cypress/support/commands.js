import 'cypress-wait-until';
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
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

//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
