import { isRecord } from '../utils.js';

export interface GlossaryTerm {
  definition: string;
  term: string;
}

export interface Glossary {
  group_terms: GlossaryTerm[] | null;
  terms: GlossaryTerm[];
}

export interface GlossaryUploadResponse {
  changes: { added: number; updated: number; removed: number; duplicates_ignored: number };
  data: Pick<Glossary, 'terms'>;
}

const parseTerms = (terms: unknown): GlossaryTerm[] => {
  if (!Array.isArray(terms)) throw new Error('Glossary terms must be an array.');
  return terms.map((entry: unknown, index) => {
    if (
      !isRecord(entry) ||
      typeof entry.term !== 'string' ||
      !entry.term.trim() ||
      typeof entry.definition !== 'string' ||
      !entry.definition.trim() ||
      Object.keys(entry).some(key => !['term', 'definition'].includes(key))
    ) {
      throw new Error(`Glossary entry ${index + 1} must contain only a non-empty "term" and "definition".`);
    }
    return { term: entry.term.trim(), definition: entry.definition.trim() };
  });
};

/** Validate the upload before making requests, including during a dry run. */
export function parseGlossary(input: unknown): Pick<Glossary, 'terms'> {
  if (!isRecord(input) || !Array.isArray(input.terms)) {
    throw new Error(
      'Glossary files must contain a "terms" array. Use { "terms": [] } to clear project terms with --replace.',
    );
  }
  if (Object.keys(input).some(key => !['terms', 'group_terms'].includes(key))) {
    throw new Error('Glossary files only support "terms" and optional "group_terms" lists.');
  }

  return {
    terms: parseTerms(input.terms),
  };
}

const normalize = (term: string) => term.trim().toLowerCase();

/** Preview the exported result; hidden stored duplicates are managed by the API. */
export function previewGlossary(existing: GlossaryTerm[], uploaded: GlossaryTerm[], replace: boolean): GlossaryTerm[] {
  const incoming = new Map<string, GlossaryTerm>();
  uploaded.forEach(term => {
    const key = normalize(term.term);
    if (!incoming.has(key)) incoming.set(key, term);
  });
  if (replace) return [...incoming.values()];

  const names = new Set(existing.map(({ term }) => normalize(term)));
  return [
    ...[...incoming].filter(([key]) => !names.has(key)).map(([, term]) => term),
    ...existing.map(term => incoming.get(normalize(term.term)) ?? term),
  ];
}
