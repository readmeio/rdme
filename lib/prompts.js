exports.generatePrompts = versionList => [
  {
    type: 'select',
    name: 'option',
    message:
      "We couldn't find a version in ReadMe matching the version in your OAS file. Would you like to use an existing version or create a new one?",
    choices: [
      { title: 'Use existing', value: 'update' },
      { title: 'Create a new version', value: 'create' },
    ],
  },
  {
    type: prev => (prev === 'update' ? 'select' : null),
    name: 'versionSelection',
    message: 'Select your desired version',
    choices: versionList.map(v => {
      return {
        title: v.version,
        // eslint-disable-next-line
        value: v._id,
      };
    }),
  },
];

exports.createVersionPrompt = versionList => [
  {
    type: 'select',
    name: 'fork',
    message: 'Which version would you like to fork from?',
    choices: versionList.map(v => {
      return {
        title: v.version,
        // eslint-disable-next-line
        value: v._id,
      };
    }),
  },
  {
    type: 'select',
    name: 'main',
    message: 'Would you like to make this version the main version?',
    choices: [{ title: 'Yes', value: true }, { title: 'No', value: false }],
  },
];
