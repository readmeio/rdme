const semver = require('semver');
const { prompt } = require('enquirer');
const parse = require('parse-link-header');

exports.generatePrompts = (versionList, selectOnly = false) => [
  {
    type: 'select',
    name: 'option',
    message: 'Would you like to use an existing project version or create a new one?',
    skip() {
      return selectOnly;
    },
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
      return selectOnly ? false : this.enquirer.answers.option !== 'update';
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
      return selectOnly ? true : this.enquirer.answers.option === 'update';
    },
    hint: '1.0.0',
  },
];

function specOptions(specList, parsedDocs, currPage, totalPages) {
  const specs = specList.map(s => {
    return {
      message: s.title,
      value: s._id, // eslint-disable-line no-underscore-dangle
    };
  });
  if (parsedDocs.prev.page) specs.push({ message: `< Prev (page ${currPage - 1} of ${totalPages})`, value: 'prev' });
  if (parsedDocs.next.page) {
    specs.push({ message: `Next (page ${currPage + 1} of ${totalPages}) >`, value: 'next' });
  }
  return specs;
}

const updateOasPrompt = (specList, parsedDocs, currPage, totalPages, getSpecs) => [
  {
    type: 'select',
    name: 'specId',
    message: 'Select your desired file to update',
    choices: specOptions(specList, parsedDocs, currPage, totalPages),
    async result(spec) {
      if (spec === 'prev') {
        try {
          const newSpecs = await getSpecs(`${parsedDocs.prev.url}`);
          const newParsedDocs = parse(newSpecs.headers.get('link'));
          const newSpecList = await newSpecs.json();
          const { specId } = await prompt(
            updateOasPrompt(newSpecList, newParsedDocs, currPage - 1, totalPages, getSpecs)
          );
          return specId;
        } catch (e) {
          return null;
        }
      }
      if (spec === 'next') {
        try {
          const newSpecs = await getSpecs(`${parsedDocs.next.url}`);
          const newParsedDocs = parse(newSpecs.headers.get('link'));
          const newSpecList = await newSpecs.json();
          const { specId } = await prompt(
            updateOasPrompt(newSpecList, newParsedDocs, currPage + 1, totalPages, getSpecs)
          );
          return specId;
        } catch (e) {
          return null;
        }
      }
      return spec;
    },
  },
];

exports.createOasPrompt = (specList, parsedDocs, totalPages, getSpecs) => [
  {
    type: 'select',
    name: 'option',
    message: 'Would you like to update an existing OAS file or create a new one?',
    choices: [
      { message: 'Update existing', value: 'update' },
      { message: 'Create a new spec', value: 'create' },
    ],
    async result(picked) {
      if (picked === 'update') {
        try {
          const { specId } = await prompt(updateOasPrompt(specList, parsedDocs, 1, totalPages, getSpecs));
          return specId;
        } catch (e) {
          return null;
        }
      }
      return picked;
    },
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
    initial: opts.newVersion || false,
    skip() {
      return opts.newVersion || !isUpdate;
    },
    hint: '1.0.0',
    validate(val) {
      return semver.valid(semver.coerce(val)) ? true : this.styles.danger('Please specify a semantic version.');
    },
  },
  {
    type: 'confirm',
    name: 'is_stable',
    message: 'Would you like to make this version the main version for this project?',
    skip() {
      return opts.main || isUpdate?.is_stable;
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
