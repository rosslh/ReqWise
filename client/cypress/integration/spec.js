describe('Landing page', () => {
	beforeEach(() => {
		cy.visit('/')
	});

	it('has the correct <h1>', () => {
		cy.contains('h1', 'ReqWise')
	});

	it('can navigate to login', () => {
		cy.get('#loginLink').click();
		cy.url().should('include', 'login');
	});

	it('can navigate to signup', () => {
		cy.get('#signupLink').click();
		cy.url().should('include', 'sign-up');
	});
});

const login = () => {
	cy.get("#email").click().type('test@reqwise.com');
	cy.get("#email").should('have.value', "test@reqwise.com");
	cy.get("#pwd").click().type('1234');
	cy.get("#pwd").should('have.value', "1234");
	cy.get(".submitButton").click();
	cy.url().should('not.include', 'login');
};

describe('Login page', () => {
	beforeEach(() => {
		cy.visit('/login')
	});

	it('has the correct <h1>', () => {
		cy.contains('h1', 'Log in')
	});

	it('can login', () => {
		login();
		cy.url().should('include', 'teams');
	});
});

describe('Teams page', () => {
	beforeEach(() => {
		cy.visit('/teams')
		login();
	});

	it('has the correct <h1>', () => {
		cy.contains('h1', 'My Teams')
	});

	it('has test team', () => {
		cy.contains('a', "Test team (don't delete)");
	});

	it('can create team', () => {
		cy.get("#createTeamButton").click();
		cy.get("#teamName").click().type('test name');
		cy.get("#teamDesc").click().type('test description');
		cy.get(".submitButton").click();
		cy.contains("a", "test name");
		cy.contains("td", "test description");
	});
});

describe('Team page', () => {
	beforeEach(() => {
		cy.visit('/teams')
		login();
		cy.get("a.teamLink").last().click();
		cy.url().should('include', 'team/');
	});

	it('can update name and description', () => {
		cy.get("#name").click().clear().type("new name");
		cy.get("#description").click().clear().type("new description");
		cy.get(".submitButton").click();
		cy.reload(); // ensure new data is persisted
		cy.get("#name").should('have.value', "new name");
		cy.get("#description").should('have.value', "new description");
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
		cy.url().should('include', 'teams');
		cy.contains('h1', 'My Teams')
		cy.get(".skeletonWrapper").should('not.exist');
		cy.get("body").find("a.teamLink").should('have.length', 1);
	});
});

const goToProject = () => {
	cy.visit('/teams')
	login();
	cy.get("a.teamLink").first().click();
	cy.url().should('include', 'team/');
	cy.contains('a', "Test project (don't delete)");
	cy.get("a.projectLink").first().click();
	cy.url().should('include', 'project/');
};

describe('Project page', () => {
	beforeEach(() => {
		goToProject();
	});

	it('has the correct <h1>', () => {
		cy.contains('h1', "Test project (don't delete)");
	});

	it('redirects correctly', () => {
		cy.contains('h2', "Features");
	});
});

describe('Features page', () => {
	beforeEach(() => {
		goToProject();
	});

	it('can add feature', () => {
		cy.get("#addFeatureButton").click();
		cy.contains('h3', "Add a Feature");
		cy.get("#desc").click().type("New feature");
		cy.get("#addFeatureModalButton").click();
		cy.contains("h3", "New feature");
		cy.reload(); // ensure data is persisted
		cy.contains("h3", "New feature");
	});

	it('can add requirement', () => {
		cy.get(".addRequirementButton").first().click();
		cy.contains('h3', "Add a Requirement");
		cy.get("#desc").click().type("New requirement");
		cy.get("#submitRequirementButton").click();
		cy.contains("li.requirement div.desc", "New requirement");
		cy.reload(); // ensure data is persisted
		cy.contains("li.requirement div.desc", "New requirement");
	});

	it('can delete requirement', () => {
		cy.get("li.requirement", { force: true }).click();
		cy.get('#deleteRequirementButton').click();
		cy.get("#confirmReqDeleteButton").click();
		cy.get('li.requirement').should('not.exist');
		cy.reload(); // ensure deletion is persisted
		cy.get('li.requirement').should('not.exist');
	});

	it('can delete feature', () => {
		cy.get("button.deleteReqgroupButton").first().click();
		cy.get("button#confirmReqgroupDelete").click();
		cy.get('div.reqgroup').should('not.exist');
		cy.reload(); // ensure deletion is persisted
		cy.get('div.reqgroup').should('not.exist');
	});
});