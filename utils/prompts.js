exports.generatePrompts = versionList => [
  {
    type: 'select',
    name: 'option',
    message:
      "We couldn't find a version in ReadMe matching the version in your OAS file. Would you like to use an existing version or create a new one?",
    choices: [
      { message: 'Use existing', value: 'update' },
      { message: 'Create a new version', value: 'create' },
    ],
  },
  {
    type: 'select',
    name: 'versionSelection',
    message: 'Select your desired version',
    skip() {
      return this.enquirer.answers.option !== 'update';
    },
    choices: versionList.map(v => {
      return {
        message: v.version,
        value: v.version,
      };
    }),
  },
];

exports.createVersionPrompt = (versionList, opts, isUpdate) => [
  {
    type: 'select',
    name: 'from',
    message: 'Which version would you like to fork from?',
    skip() {
      return opts.fork || isUpdate;
    },
    choices: versionList.map(v => {
      return {
        message: v.version,
        value: v.version,
      };
    }),
  },
  {
    type: 'input',
    name: 'newVersion',
    message: "What's your new version?",
    skip() {
      return opts.newVersion || !isUpdate;
    },
    hint: '1.0.0',
  },
  {
    type: 'confirm',
    name: 'is_stable',
    message: 'Would you like to make this version the main version for this project?',
    skip() {
      return opts.main || (isUpdate && isUpdate.is_stable);
    },
  },
  {
    type: 'confirm',
    name: 'is_beta',
    message: 'Should this version be in beta?',
    skip: () => opts.beta,
  },
  {
    type: 'confirm',
    name: 'is_hidden',
    message: 'Would you like to make this version public?',
    skip() {
      return opts.isPublic || opts.main || this.enquirer.answers.is_stable;
    },
  },
  {
    type: 'confirm',
    name: 'is_deprecated',
    message: 'Would you like to deprecate this version?',
    skip() {
      return opts.deprecated || opts.main || !isUpdate || this.enquirer.answers.is_stable;
    },
  },
];
