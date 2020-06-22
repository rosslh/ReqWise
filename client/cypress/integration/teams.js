describe('Account page', () => {
    before(() => {
        cy.visit('/account')
        cy.login();
        cy.contains('h2', 'My Teams')
        cy.waitForSkeleton();
    })

    beforeEach(() => {
        Cypress.Cookies.preserveOnce('__session');
    });

    it('has the correct content', () => {
        cy.contains('a', "Test team (don't delete)");
    });

    it('can create team', () => {
        cy.get("#createTeamButton").click();
        cy.get("#teamName").click().type('test name');
        cy.get("#teamDesc").click().type('test description');
        cy.get(".submitButton").click();
        cy.waitForSpinner();
        cy.contains("a", "test name");
        cy.contains("td", "test description");
    });
});

describe('Team page', () => {
    before(() => {
        cy.visit('/account')
        cy.login();
        cy.url().should('include', '/account');
        cy.waitForSkeleton();
        cy.contains('a', "test name").click();
        cy.url().should('include', '/team/');
    });

    beforeEach(() => {
        Cypress.Cookies.preserveOnce('__session');
        cy.waitForSkeleton();
    });

    it('can update name and description', () => {
        cy.get("#name").click().clear().type("new name");
        cy.get("#description").click().clear().type("new description");
        cy.get(".submitButton").click();
        cy.waitForSpinner();
        cy.reload(); // ensure new data is persisted
        cy.get("#name").should('have.value', "new name");
        cy.get("#description").should('have.value', "new description");

        cy.wait(3000); // wait for input interactive

        cy.get("#name").click().clear().type("test name");
        cy.get("#description").click().clear().type("test description");
        cy.get(".submitButton").click();
        cy.waitForSpinner();
        cy.reload(); // ensure new data is persisted
        cy.get("#name").should('have.value', "test name");
        cy.get("#description").should('have.value', "test description");
    });

    it('can invite member', () => {
        cy.get("#inviteMemberButton").click();
        cy.get("#inviteeEmail").click().type("test2@reqwise.com");
        cy.get(".submitButton#inviteSubmitButton").click();
        cy.contains("td.inviteeEmail", "test2@reqwise.com");
        cy.get(".deleteInviteButton").click();
        cy.get("td.inviteeRow").should('not.exist');
    });

    it('can delete team', () => { // must be last
        cy.get("#deleteTeamButton").click();
        cy.url().should('include', 'account');
        cy.contains('h2', 'My Teams')
        cy.waitForSkeleton();
        cy.get("body").find("a.teamLink").should('have.length', 1);
    });
});