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
    cy.get("#email").should('have.value', "test@reqwise.com");
    cy.get("#pwd").click().type('1234');
    cy.get("#pwd").should('have.value', "1234");
    cy.get(".submitButton").click();
    cy.get('.loadingSpinner').should('not.exist');
    cy.url().should('not.include', 'login');
});

Cypress.Commands.add("goToProject", () => {
    cy.visit('/teams')
    cy.login();
    cy.contains('a', "Test team (don't delete)").click();
    cy.url().should('include', 'team/');
    cy.contains('a', "Test project (don't delete)").click();
    cy.url().should('include', 'project/');
});
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
