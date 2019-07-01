exports.generatePrompts = (versionList) => [
  {
    type: 'select',
    name: 'option',
    message: 'We couldn\'t find a version in ReadMe matching the version in your OAS file. Would you like to use an existing version or create a new one?',
    choices: [
      { title: 'Use existing', value: 'update' },
      { title: 'Create a new version', value: 'create' }
    ],
  },
  {
    type: prev => prev === 'update' ? 'select' : null,
    name: 'versionSelection',
    message: 'Select your desired version',
    choices: versionList.map(v => {
      return {
        title: v.version,
        // eslint-disable-next-line
        value: v._id
      };
    }),
  }
];
