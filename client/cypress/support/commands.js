import 'cypress-wait-until';

Cypress.Commands.add("login", () => {
    cy.clearCookie('__session');
    cy.reload();
    cy.url().should('include', '/login');
    cy.get("#email").click().type('test@reqwise.com');
    cy.get("#pwd").click().type('1234');
    cy.get(".submitButton").click();
    cy.waitForSpinner();
    cy.waitForPreload();
    cy.url().should('not.include', 'login');
});

Cypress.Commands.add("goToProject", () => {
    cy.visit('/account')
    cy.login();
    cy.waitForSkeleton();
    cy.contains('a', "Test team (don't delete)").click();
    cy.url().should('include', 'team/');
    cy.contains("h1", "Test team (don't delete)");
    cy.waitForSkeleton();
    cy.contains('a', "Test project (don't delete)").click();
    cy.url().should('include', 'project/');
    cy.contains('h1', "Test project (don't delete)")
});

Cypress.Commands.add("goToRequirement", () => {
    cy.visit('/account')
    cy.login();
    cy.waitForSkeleton();
    cy.contains('a', "Test team (don't delete)").click();
    cy.url().should('include', 'team/');
    cy.contains("h1", "Test team (don't delete)");
    cy.waitForSkeleton();
    cy.contains('a', "Test project (don't delete)").click();
    cy.url().should('include', 'project/');
    cy.contains('h1', "Test project (don't delete)")
    cy.contains('a', "Test feature (don't delete)").click();
    cy.url().should('include', 'reqgroup/');
    cy.contains('h2', "View requirement group")
    cy.get('button.commentIconWrapper').click();
    cy.url().should('include', 'requirement/');
    cy.contains('h2', "View requirement");
});

Cypress.Commands.add("waitForSpinner", () => cy.waitUntil(() => !Cypress.$('.loadingSpinner').length, { timeout: 30000, interval: 500 }));

Cypress.Commands.add("waitForSkeleton", () => cy.waitUntil(() => !Cypress.$('.skeletonWrapper').length, { timeout: 30000, interval: 500 }));

Cypress.Commands.add("waitForPreload", () => cy.waitUntil(() => !Cypress.$('main#preloading').length, { timeout: 30000, interval: 500 }));
