import type { APIv2PageExportCommands } from '../index.js';
import type { PageRequestSchema } from '../types.js';
import type { CategoryPagesResponseSchema, CategoryResponseSchema, PageResponseSchema } from './types/index.js';

import fs from 'node:fs';
import path from 'node:path';

import { dump as dumpYAML } from 'js-yaml';
import ora from 'ora';
import removeUndefinedObjects from 'remove-undefined-objects';

import { isRecord } from '../utils.js';

import { parse as parseFrontmatter } from './frontmatter.js';
import { oraOptions } from './logger.js';

type ChangelogsRequestSchema = PageRequestSchema<'changelogs'>;
type CustomPagesRequestSchema = PageRequestSchema<'custom_pages'>;
type GuidesOrReferenceRequestSchema = PageRequestSchema<'guides' | 'reference'>;
type GeneralRequestSchema = ChangelogsRequestSchema | CustomPagesRequestSchema | GuidesOrReferenceRequestSchema;

type GuidesOrReferenceResponseSchema = PageResponseSchema<'guides' | 'reference'>;

function isGuideOrReferenceRequest(
  route: string,
  // oxlint-disable-next-line no-unused-vars
  data: ChangelogsRequestSchema | CustomPagesRequestSchema | GuidesOrReferenceRequestSchema,
): data is GuidesOrReferenceRequestSchema {
  return route === 'guides' || route === 'reference';
}

export interface FullExportResults {
  completed: GeneralRequestSchema[];
  failed: string[];
  skipped: number;
}

interface FileMapEntry {
  category: string | undefined;
  filePath: string;
  parent: string | undefined;
  slug: string;
  title: unknown;
}

/**
 * Scrub out unnecessary data from the API and simplify fields.
 *
 */
function scrub(data: GeneralRequestSchema): Record<string, unknown> | undefined {
  const denylist = new Set(['api', 'href', 'links', 'project', 'renderable', 'updated_at', 'uri']);

  /** API defaults (to ensure we omit these when they're unchanged) */
  const DEFAULTS = {
    allow_crawlers: 'enabled',
    state: 'current',
    type: 'basic',
  } as const;

  const scrubbed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (denylist.has(key)) {
      // no-op
    } else if (key === 'content' && typeof value === 'object' && value !== null) {
      const {
        body: _body,
        link,
        ...rest
      } = value as Record<string, unknown> & {
        body?: unknown;
        link?: unknown;
      };

      const filtered = { ...rest };
      if ('type' in data && data.type === 'link' && link) {
        filtered.link = link;
      }

      scrubbed[key] = filtered;
    } else if (key === 'category' && isRecord(value) && typeof value.uri === 'string') {
      const name = decodeURIComponent(value.uri.split('/').pop() || '');
      scrubbed[key] = { uri: name };
    } else if (key === 'parent' && isRecord(value) && typeof value.uri === 'string') {
      const slugPart = decodeURIComponent(value.uri.split('/').pop() || '');
      scrubbed[key] = { uri: slugPart };
    } else if (!(key in DEFAULTS && value === DEFAULTS[key as keyof typeof DEFAULTS])) {
      scrubbed[key] = value;
    }
  }

  return removeUndefinedObjects(scrubbed, { removeAllFalsy: true });
}

function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function buildFileMap(this: APIv2PageExportCommands, files: string[]): Map<string, FileMapEntry> {
  const fileMap = new Map<string, FileMapEntry>();

  for (const filePath of files) {
    const frontmatter = parseFrontmatter.call(this, filePath);
    if (frontmatter) {
      const slug = frontmatter.slug;
      if (typeof slug === 'string' && slug) {
        const categoryUri =
          isRecord(frontmatter.category) && typeof frontmatter.category.uri === 'string'
            ? frontmatter.category.uri
            : undefined;
        const parentUri =
          isRecord(frontmatter.parent) && typeof frontmatter.parent.uri === 'string'
            ? frontmatter.parent.uri
            : undefined;

        fileMap.set(slug, {
          category: categoryUri,
          filePath,
          parent: parentUri,
          slug,
          title: frontmatter.title,
        });
      } else {
        this.warn(`No slug found in ${filePath}`);
      }
    }
  }

  return fileMap;
}

function buildPath(
  this: APIv2PageExportCommands,
  slug: string,
  fileMap: Map<string, FileMapEntry>,
  visited: Set<string> = new Set(),
): string | null {
  if (visited.has(slug)) {
    this.error(`Circular reference detected for slug: ${slug}`);
  }
  visited.add(slug);

  const fileInfo = fileMap.get(slug);
  if (!fileInfo) {
    this.error(`File not found for slug: ${slug}`);
    return null;
  }

  const parts: string[] = [];

  if (fileInfo.category) parts.push(fileInfo.category);

  if (fileInfo.parent) {
    const parentPath = buildPath.call(this, fileInfo.parent, fileMap, visited);
    if (parentPath) {
      const segments = parentPath.split('/');
      for (let i = 1; i < segments.length; i += 1) {
        if (!parts.includes(segments[i])) {
          parts.push(segments[i]);
        }
      }
    }
  }

  parts.push(slug);
  return parts.join('/');
}

function restructureFiles(this: APIv2PageExportCommands, tempFolder: string, finalFolder: string): void {
  const restructureSpinner = ora({ ...oraOptions() }).start('🗃️  Restructuring files...');

  const files = findMarkdownFiles(tempFolder);
  this.debug(`Found ${files.length} markdown files`);

  const fileMap = buildFileMap.call(this, files);
  this.debug(`Parsed ${fileMap.size} files with valid frontmatter`);

  const results: { slug: string; oldPath: string; newPath: string; title: unknown }[] = [];
  for (const [slug] of fileMap) {
    const newPathBuilt = buildPath.call(this, slug, fileMap);
    if (newPathBuilt) {
      const info = fileMap.get(slug)!;
      results.push({
        slug,
        oldPath: info.filePath,
        newPath: `${newPathBuilt}.md`,
        title: info.title,
      });
    }
  }

  const hasChildren = new Set<string>();
  for (const info of fileMap.values()) {
    if (info.parent) hasChildren.add(info.parent);
  }

  for (const r of results) {
    if (hasChildren.has(r.slug)) {
      r.newPath = r.newPath.replace(/\.md$/, '/index.md');
    }
  }

  results.sort((a, b) => a.newPath.localeCompare(b.newPath));

  fs.mkdirSync(finalFolder, { recursive: true });

  this.debug('Copying files to final structure:');

  for (const r of results) {
    const dest = path.join(finalFolder, r.newPath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(r.oldPath, dest);
  }

  restructureSpinner.suffixText = '';
  restructureSpinner.succeed(`${restructureSpinner.text} done!`);
  this.debug(`Files moved: ${finalFolder}`);

  fs.rmSync(tempFolder, { recursive: true, force: true });
  this.debug(`Cleaned up temporary folder: ${tempFolder}`);
}

export async function exportDocs(this: APIv2PageExportCommands): Promise<FullExportResults> {
  const outputDir = path.resolve(this.args.folder);
  const tempFolder = path.join(outputDir, '.temp_download');

  const { branch } = this.flags;
  const docsOnly = this.route !== 'guides';

  const key = this.flags.key;
  const headers = new Headers({ authorization: `Bearer ${key}`, 'Content-Type': 'application/json' });

  try {
    const spinner = ora({ ...oraOptions() }).start('📩 Exporting files from ReadMe...');
    const downloads: FullExportResults = {
      completed: [],
      failed: [],
      skipped: 0,
    };

    this.debug(`Exporting pages from \`${branch}\` to ${tempFolder}`);

    fs.mkdirSync(tempFolder, { recursive: true });

    const categories = await this.readmeAPIFetch(`/branches/${encodeURIComponent(branch)}/categories/${this.route}`, {
      method: 'GET',
      headers,
    })
      .then(res => this.handleAPIRes<CategoryResponseSchema>(res))
      .then(res => res?.data || []);

    // oxlint-disable no-await-in-loop -- Sequential fetches per original script behavior.
    for (const cat of categories) {
      this.debug(`Obtaining the pages for category: ${cat.title}`);

      const pages = await this.readmeAPIFetch(
        `/branches/${encodeURIComponent(branch)}/categories/${this.route}/${encodeURIComponent(cat.title)}/pages`,
        {
          method: 'GET',
          headers,
        },
      )
        .then(res => this.handleAPIRes<CategoryPagesResponseSchema>(res))
        .then(res => res?.data || []);

      if (!pages.length) {
        this.warn(`No pages found within the "${cat.title}" category. Skipping.`);
      } else {
        const parentCounts: Record<string, number> = {};
        for (const page of pages) {
          try {
            const isReference = this.route === 'reference';
            const pagePath = isReference
              ? `/branches/${encodeURIComponent(branch)}/reference/${encodeURIComponent(page.slug)}`
              : `/branches/${encodeURIComponent(branch)}/guides/${encodeURIComponent(page.slug)}`;

            // const pageResult = await fetchJSON.call(this, pagePath);
            const data = await this.readmeAPIFetch(pagePath, {
              method: 'GET',
              headers,
            })
              .then(res => this.handleAPIRes<GuidesOrReferenceResponseSchema>(res))
              .then(res => res.data)
              .catch(() => {
                this.warn(`Failed to fetch page "${page.slug}". Skipping.`);
                downloads.failed.push(page.slug);
              });

            if (data) {
              const output = structuredClone<GeneralRequestSchema>(data);
              const body = output.content?.body || '';
              const skipForDocsOnly =
                isGuideOrReferenceRequest(this.route, output) && docsOnly && !body.trim() && output.type !== 'link';

              if (skipForDocsOnly) {
                this.debug(`Skipping empty ${output.type} page because it is not a link: ${output.slug}`);
                downloads.skipped += 1;
              } else {
                if (isGuideOrReferenceRequest(this.route, output)) {
                  const parentKey =
                    isRecord(output.parent) && typeof output.parent.uri === 'string' ? output.parent.uri : 'root';
                  if (parentCounts[parentKey] === undefined) {
                    parentCounts[parentKey] = 0;
                  }

                  output.position = parentCounts[parentKey];
                  parentCounts[parentKey] += 1;
                }

                const frontmatter = scrub(output);
                const yamlFront = dumpYAML(frontmatter, { sortKeys: true });
                const md = `---\n${yamlFront}---\n${body}`;

                fs.writeFileSync(path.join(tempFolder, `${output.slug}.md`), md, 'utf8');
                downloads.completed.push(output);
              }
            }
          } finally {
            spinner.suffixText = `(${downloads.completed.length} succeeded, ${downloads.failed.length} failed, ${downloads.skipped} skipped)`;
          }
        }
      }
    }
    // oxlint-enable no-await-in-loop

    spinner.suffixText = '';

    if (downloads.failed.length) {
      spinner.fail(`${spinner.text} ${downloads.failed.length} file(s) failed.`);
    } else {
      spinner.succeed(`${spinner.text} done!`);
    }

    if (downloads.failed.length) {
      this.log('');
      this.log(`🚨 Received errors when attempting to download ${downloads.failed.length} page(s):`);
      downloads.failed.forEach(slug => {
        this.log(`   - ${slug}`);
      });
    } else {
      restructureFiles.call(this, tempFolder, outputDir);

      this.log('');
      this.log(`All files have been saved to: ${outputDir}`);
    }

    return downloads;
  } catch (err) {
    if (fs.existsSync(tempFolder)) {
      fs.rmSync(tempFolder, { recursive: true, force: true });
    }

    throw err;
  }
}
