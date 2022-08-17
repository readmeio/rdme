import type { Response } from 'node-fetch';
import type { Answers, Choice, PromptObject } from 'prompts';

import parse from 'parse-link-header';
import semver from 'semver';

import promptTerminal from './promptWrapper';

type SpecList = {
  _id: string;
  title: string;
}[];

type VersionList = {
  version: string;
}[];

type ParsedDocs = {
  next?: {
    page: number;
    url: string;
  };
  prev?: {
    page: number;
    url: string;
  };
};

export function generatePrompts(versionList: VersionList, selectOnly = false) {
  return [
    {
      type: selectOnly ? null : 'select',
      name: 'option',
      message: 'Would you like to use an existing project version or create a new one?',
      choices: [
        { title: 'Use existing', value: 'update' },
        { title: 'Create a new version', value: 'create' },
      ],
    },
    {
      type: (prev, values) => {
        return (selectOnly ? false : values.option !== 'update') ? null : 'select';
      },
      name: 'versionSelection',
      message: 'Select your desired version',
      choices: versionList.map(v => {
        return {
          title: v.version,
          value: v.version,
        };
      }),
    },
    {
      type: (prev, values) => {
        return (selectOnly ? true : values.option === 'update') ? null : 'text';
      },
      name: 'newVersion',
      message: "What's your new version?",
      hint: '1.0.0',
    },
  ] as PromptObject[];
}

function specOptions(specList: SpecList, parsedDocs: ParsedDocs, currPage: number, totalPages: number) {
  const specs = specList.map(s => {
    return {
      description: `API Definition ID: ${s._id}`, // eslint-disable-line no-underscore-dangle
      title: s.title,
      value: s._id, // eslint-disable-line no-underscore-dangle
    };
  });
  if (parsedDocs?.prev?.page)
    specs.push({
      description: 'Go to the previous page',
      title: `< Prev (page ${currPage - 1} of ${totalPages})`,
      value: 'prev',
    });
  if (parsedDocs?.next?.page) {
    specs.push({
      description: 'Go to the next page',
      title: `Next (page ${currPage + 1} of ${totalPages}) >`,
      value: 'next',
    });
  }
  return specs as Choice[];
}

const updateOasPrompt = (
  specList: SpecList,
  parsedDocs: ParsedDocs,
  currPage: number,
  totalPages: number,
  getSpecs: (url: string) => Promise<Response>
) =>
  [
    {
      type: 'select',
      name: 'specId',
      message: 'Select your desired file to update',
      choices: specOptions(specList, parsedDocs, currPage, totalPages),
      async format(spec: string) {
        if (spec === 'prev') {
          try {
            const newSpecs = await getSpecs(`${parsedDocs.prev.url}`);
            const newParsedDocs = parse(newSpecs.headers.get('link'));
            const newSpecList = await newSpecs.json();
            const { specId }: Answers<string> = await promptTerminal(
              updateOasPrompt(newSpecList, newParsedDocs, currPage - 1, totalPages, getSpecs)
            );
            return specId;
          } catch (e) {
            return null;
          }
        } else if (spec === 'next') {
          try {
            const newSpecs = await getSpecs(`${parsedDocs.next.url}`);
            const newParsedDocs = parse(newSpecs.headers.get('link'));
            const newSpecList = await newSpecs.json();
            const { specId }: Answers<string> = await promptTerminal(
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
  ] as PromptObject[];

export function createOasPrompt(
  specList: SpecList,
  parsedDocs: ParsedDocs,
  totalPages: number,
  getSpecs: ((url: string) => Promise<Response>) | null
) {
  return [
    {
      type: 'select',
      name: 'option',
      message: 'Would you like to update an existing OAS file or create a new one?',
      choices: [
        { title: 'Update existing', value: 'update' },
        { title: 'Create a new spec', value: 'create' },
      ],
      async format(picked: string) {
        if (picked === 'update') {
          const { specId }: Answers<string> = await promptTerminal(
            updateOasPrompt(specList, parsedDocs, 1, totalPages, getSpecs)
          );
          return specId;
        }

        return picked;
      },
    },
  ] as PromptObject[];
}

export function createVersionPrompt(
  versionList: VersionList,
  opts: {
    beta?: string | boolean;
    deprecated?: string;
    fork?: string;
    isPublic?: string | boolean;
    main?: string | boolean;
    newVersion?: string;
  },
  isUpdate?: {
    is_stable: string;
  }
) {
  return [
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
      validate(val: string) {
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
}
