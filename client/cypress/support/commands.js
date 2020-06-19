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
    cy.waitForSpinner(15000); // timeout after 15 seconds
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
});



Cypress.Commands.add("waitForSpinner", (timeout = 10000) => cy.waitUntil(() => cy.get('.loadingSpinner').should('not.be.visible'), { timeout }));
Cypress.Commands.add("waitForSkeleton", (timeout = 10000) => cy.waitUntil(() => cy.get('.skeletonWrapper').should('not.be.visible'), { timeout }));

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
