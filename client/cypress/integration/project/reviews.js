describe('Reviews', () => {
  const goToFeatures = () => {
    cy.contains('a', "Features").click();
    cy.waitForPreload();
    cy.waitForSkeleton();
    cy.url().should('include', '/features');
    cy.contains('h2', "Features")
  };

  before(() => {
    cy.goToProject();
    goToFeatures();
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('__session');
  });

  const createDraft = () => {
    cy.get('#addFeatureButton').click();
    cy.contains('h3', "Add a Feature");
    cy.get('#desc').click().type("Draft feature");
    cy.get('#addFeatureModalButton').click();
    cy.waitForSpinner();
    cy.contains("h3", "Draft feature");
  };

  const deleteDraft = () => {
    cy.get('button.deleteReqgroupButton[data-reqgroup="Draft feature"]').first().click();
    cy.get('button#confirmReqgroupDelete').click();
    cy.get('div.reqgroup').should('have.length', 1);
  };

  const undraft = () => {
    cy.get('.reqgroup[data-cy="Draft feature"]').within(() => {
      cy.get('#editReqgroupButton').click();
    });
    cy.contains('h3', "Update feature");
    cy.get('#isDraft').click();
    cy.get('#updateReqgroupButton').click();
    cy.waitForSpinner();
    cy.get('.ribbon[data-cy="Pending"]').should("exist");
  };

  it('can add draft feature', createDraft);

  it('can undraft feature and create review', undraft);

  it('can withdraw review', () => {
    cy.get('.ribbon[data-cy="Pending"]').click();
    cy.waitForPreload();
    cy.get('button[data-cy="withdrawReviewButton"]').click();
    cy.get('button#withdrawReviewButton').click();
    cy.waitForSpinner();
    cy.goToProject();
    goToFeatures();
    cy.get('.ribbon[data-cy="Pending"]').should("not.exist");
  });

  it('can delete draft feature', deleteDraft);

  it('can add draft feature', createDraft);

  it('can undraft feature and create review', undraft);

  it('can accept review', () => {
    cy.goToProject('test.stakeholder@reqwise.com', '1234');
    goToFeatures();
    cy.get('.ribbon[data-cy="Pending"]').click();
    cy.waitForPreload();
    cy.get('button[data-cy="reviewChangesButton"]').click();
    cy.get('#accept').click();
    cy.get('textarea[data-cy="commentField"').click().type("Approved.");
    cy.get("#submitButton").click();
    cy.waitForSpinner();
    cy.goToProject('test.owner@reqwise.com', '1234'); // login as owner to delete
    goToFeatures();
    cy.get('.ribbon[data-cy="Pending"]').should("not.exist");
    cy.get('.ribbon[data-cy="Accepted"]').should("exist");
  });

  it('can unpublish feature', () => {
    cy.get('.ribbon[data-cy="Accepted"]').should("exist");
    cy.get('button[data-cy="makeDraftButton"').click();
    cy.get("#makeDraftButton").click();
    cy.waitForSpinner();
    cy.reload();
    cy.get('.ribbon[data-cy="Accepted"]').should("not.exist");
  });

  it('can delete draft feature', deleteDraft);
});
