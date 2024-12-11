import type { Choice, PromptObject } from 'prompts';

import parse from 'parse-link-header';

import { debug } from './logger.js';
import promptTerminal from './promptWrapper.js';
import { handleAPIv1Res } from './readmeAPIFetch.js';

interface Spec {
  _id: string;
  title: string;
}

export type OpenAPIPromptOptions = 'create' | 'update';

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

function specOptions(
  specList: SpecList,
  parsedDocs: ParsedDocs | null,
  currPage: number,
  totalPages: number,
): Choice[] {
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
  parsedDocs: ParsedDocs | null,
  currPage: number,
  totalPages: number,
  getSpecs: (url: string) => Promise<Response>,
): PromptObject<'specId'>[] => [
  {
    type: 'select',
    name: 'specId',
    message: 'Select your desired file to update',
    choices: specOptions(specList, parsedDocs, currPage, totalPages),
    async format(spec: string) {
      if (spec === 'prev') {
        try {
          const newSpecs = await getSpecs(`${parsedDocs?.prev?.url || ''}`);
          const newParsedDocs = parse(newSpecs.headers.get('link'));
          const newSpecList = await handleAPIv1Res(newSpecs);
          const { specId }: { specId: string } = await promptTerminal(
            updateOasPrompt(newSpecList, newParsedDocs, currPage - 1, totalPages, getSpecs),
          );
          return specId;
        } catch (e) {
          debug(`error retrieving previous specs: ${e.message}`);
          return null;
        }
      } else if (spec === 'next') {
        try {
          const newSpecs = await getSpecs(`${parsedDocs?.next?.url || ''}`);
          const newParsedDocs = parse(newSpecs.headers.get('link'));
          const newSpecList = await handleAPIv1Res(newSpecs);
          const { specId }: { specId: string } = await promptTerminal(
            updateOasPrompt(newSpecList, newParsedDocs, currPage + 1, totalPages, getSpecs),
          );
          return specId;
        } catch (e) {
          debug(`error retrieving next specs: ${e.message}`);
          return null;
        }
      }

      return spec;
    },
  },
];

export function createOasPrompt(
  specList: SpecList,
  parsedDocs: ParsedDocs | null,
  totalPages: number,
  getSpecs: (url: string) => Promise<Response>,
): PromptObject<'option'>[] {
  return [
    {
      type: 'select',
      name: 'option',
      message: 'Would you like to update an existing OAS file or create a new one?',
      choices: [
        { title: 'Update existing', value: 'update' },
        { title: 'Create a new spec', value: 'create' },
      ],
      async format(picked: OpenAPIPromptOptions) {
        if (picked === 'update') {
          const { specId }: { specId: string } = await promptTerminal(
            updateOasPrompt(specList, parsedDocs, 1, totalPages, getSpecs),
          );
          return specId;
        }

        return picked;
      },
    },
  ];
}
