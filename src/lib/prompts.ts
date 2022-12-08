import type { Version } from '../cmds/versions';
import type { Options as VersionCreateOptions } from 'cmds/versions/create';
import type { Options as VersionUpdateOptions } from 'cmds/versions/update';
import type { Response } from 'node-fetch';
import type { Choice, PromptObject } from 'prompts';

import parse from 'parse-link-header';
import semver from 'semver';

import promptTerminal from './promptWrapper';

interface Spec {
  _id: string;
  title: string;
}

type SpecList = Spec[];

interface ParsedDocs {
  next?: {
    page: number;
    url: string;
  };
  prev?: {
    page: number;
    url: string;
  };
}

function specOptions(specList: SpecList, parsedDocs: ParsedDocs, currPage: number, totalPages: number): Choice[] {
  const specs = specList.map(s => {
    return {
      description: `API Definition ID: ${s._id}`, // eslint-disable-line no-underscore-dangle
      title: s.title,
      value: s._id, // eslint-disable-line no-underscore-dangle
    };
  });
  if (parsedDocs?.prev?.page) {
    specs.push({
      description: 'Go to the previous page',
      title: `< Prev (page ${currPage - 1} of ${totalPages})`,
      value: 'prev',
    });
  }
  if (parsedDocs?.next?.page) {
    specs.push({
      description: 'Go to the next page',
      title: `Next (page ${currPage + 1} of ${totalPages}) >`,
      value: 'next',
    });
  }
  return specs;
}

const updateOasPrompt = (
  specList: SpecList,
  parsedDocs: ParsedDocs,
  currPage: number,
  totalPages: number,
  getSpecs: (url: string) => Promise<Response>
): PromptObject[] => [
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
          // @todo: figure out how to add a stricter type here, see:
          // https://github.com/readmeio/rdme/pull/570#discussion_r949715913
          const { specId } = await promptTerminal(
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
          // @todo: figure out how to add a stricter type here, see:
          // https://github.com/readmeio/rdme/pull/570#discussion_r949715913
          const { specId } = await promptTerminal(
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

export function createOasPrompt(
  specList: SpecList,
  parsedDocs: ParsedDocs,
  totalPages: number,
  getSpecs: ((url: string) => Promise<Response>) | null
): PromptObject[] {
  return [
    {
      type: 'select',
      name: 'option',
      message: 'Would you like to update an existing OAS file or create a new one?',
      choices: [
        { title: 'Update existing', value: 'update' },
        { title: 'Create a new spec', value: 'create' },
      ],
      async format(picked: 'update' | 'create') {
        if (picked === 'update') {
          // @todo: figure out how to add a stricter type here, see:
          // https://github.com/readmeio/rdme/pull/570#discussion_r949715913
          const { specId } = await promptTerminal(updateOasPrompt(specList, parsedDocs, 1, totalPages, getSpecs));
          return specId;
        }

        return picked;
      },
    },
  ];
}

export function createVersionPrompt(
  versionList: Version[],
  opts: VersionCreateOptions & VersionUpdateOptions,
  isUpdate?: {
    is_stable: boolean;
  }
): PromptObject[] {
  return [
    {
      type: opts.fork || isUpdate ? null : 'select',
      name: 'from',
      message: 'Which version would you like to fork from?',
      choices: versionList.map(v => {
        return {
          title: v.version,
          value: v.version,
        };
      }),
    },
    {
      type: opts.newVersion || !isUpdate ? null : 'text',
      name: 'newVersion',
      message: 'What should the version be renamed to?',
      initial: opts.newVersion || false,
      hint: '1.0.0',
      validate(val: string) {
        return semver.valid(semver.coerce(val)) ? true : 'Please specify a semantic version.';
      },
    },
    {
      type: opts.main || isUpdate?.is_stable ? null : 'confirm',
      name: 'is_stable',
      message: 'Would you like to make this version the main version for this project?',
    },
    {
      type: opts.beta ? null : 'confirm',
      name: 'is_beta',
      message: 'Should this version be in beta?',
    },
    {
      type: (prev, values) => {
        return opts.isPublic || opts.main || values.is_stable ? null : 'confirm';
      },
      name: 'is_hidden',
      message: 'Would you like to make this version public?',
    },
    {
      type: (prev, values) => {
        return opts.deprecated || opts.main || !isUpdate || values.is_stable ? null : 'confirm';
      },
      name: 'is_deprecated',
      message: 'Would you like to deprecate this version?',
    },
  ];
}
