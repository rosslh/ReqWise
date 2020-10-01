export const showTourStage = (introjs, stage, callback) => {
  const stages = {
    "project": projectSteps,
    "team": teamSteps
  };

  const steps = stages[stage];

  if (steps) {
    introjs.setOptions({ steps, showStepNumbers: false });
    introjs.start();
    introjs.oncomplete(callback);
  }

};

const teamSteps = [
  {
    intro: 'This is your team. A team can have multiple projects ongoing.',
    position: 'bottom'
  },
  {
    element: '[data-introjs="inviteWrapper"]',
    intro: 'You can add new team members. Team members can work on projects and collaborate with clients.',
    position: 'bottom'
  },
  {
    element: '[data-introjs="projectWrapper"]',
    intro: 'Projects organize requirements, questionnaires, and reviews for a client in one place. Let\'s go to a project now!',
    position: 'right'
  },
];

const projectSteps = [
  {
    intro: 'This is Your Project. You can create questionnaires, define requirements, upload designs, and receive feedback.',
    position: 'bottom'
  },
  {
    element: '[data-introjs="sidebar-brainstorm"]',
    intro: 'Brainstorm ideas by sharing questionnaires with stakeholders.',
    position: 'right',
  },
  {
    element: '[data-introjs="sidebar-features"]',
    intro: 'Specify features and functional requirements to make sure you really understand your stakeholders needs.',
    position: 'right',
  },
  {
    element: '[data-introjs="sidebar-files"]',
    intro: 'Attach files and designs to requirements',
    description: 'Once you understand your stakeholders\' needs, attach supplementary designs and documents.',
    position: 'right',
  },
  {
    element: '[data-introjs="sidebar-reviews"]',
    intro: 'When your requirements and designs are ready, propose them for stakeholder review.',
    description: 'Stakeholders can give their approval or request changes.',
    position: 'right',
  },
];
