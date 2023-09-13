import type { Version } from '../cmds/versions';
import type { Response } from 'node-fetch';
import type { Choice, PromptObject } from 'prompts';

import parse from 'parse-link-header';
import semver from 'semver';

import promptTerminal from './promptWrapper';
import { handleRes } from './readmeAPIFetch';

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
  getSpecs: (url: string) => Promise<Response>,
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
          const newSpecList = await handleRes(newSpecs);
          // @todo: figure out how to add a stricter type here, see:
          // https://github.com/readmeio/rdme/pull/570#discussion_r949715913
          const { specId } = await promptTerminal(
            updateOasPrompt(newSpecList, newParsedDocs, currPage - 1, totalPages, getSpecs),
          );
          return specId;
        } catch (e) {
          return null;
        }
      } else if (spec === 'next') {
        try {
          const newSpecs = await getSpecs(`${parsedDocs.next.url}`);
          const newParsedDocs = parse(newSpecs.headers.get('link'));
          const newSpecList = await handleRes(newSpecs);
          // @todo: figure out how to add a stricter type here, see:
          // https://github.com/readmeio/rdme/pull/570#discussion_r949715913
          const { specId } = await promptTerminal(
            updateOasPrompt(newSpecList, newParsedDocs, currPage + 1, totalPages, getSpecs),
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
  getSpecs: ((url: string) => Promise<Response>) | null,
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

/**
 * Series of prompts to construct a version object,
 * used in our `versions:create` and `versions:update` commands
 */
export function versionPrompt(
  /** list of versions, used for prompt about which version to fork */
  versionList: Version[],
  /** existing version if we're performing an update */
  isUpdate?: {
    is_stable: boolean;
  },
): PromptObject[] {
  return [
    {
      // only runs for versions:create command
      type: isUpdate ? null : 'select',
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
      // only runs for versions:update command
      type: !isUpdate ? null : 'text',
      name: 'newVersion',
      message: 'What should the version be renamed to?',
      hint: '1.0.0',
      validate(val: string) {
        // allow empty string, in which case the version won't be renamed
        if (!val) return true;
        return semver.valid(semver.coerce(val)) ? true : 'Please specify a semantic version.';
      },
    },
    {
      // if the existing version being updated is already the main version,
      // we can't switch that so we skip this question
      type: isUpdate?.is_stable ? null : 'confirm',
      name: 'is_stable',
      message: 'Would you like to make this version the main version for this project?',
    },
    {
      type: 'confirm',
      name: 'is_beta',
      message: 'Should this version be in beta?',
    },
    {
      type: (prev, values) => {
        // if user wants this version to be the main version
        // it can't also be hidden.
        return values.is_stable ? null : 'confirm';
      },
      name: 'is_public',
      message: 'Would you like to make this version public?',
    },
    {
      type: (prev, values) => {
        // if user wants this version to be the main version
        // it can't also be deprecated.
        return values.is_stable ? null : 'confirm';
      },
      name: 'is_deprecated',
      message: 'Would you like to deprecate this version?',
    },
  ];
}
