import type { APIv2PageUploadCommands } from '../index.js';
import type { PageRequestSchema, PageResponseSchema, ProjectRepresentation } from './types/index.js';

import path from 'node:path';

import chalk from 'chalk';
import ora from 'ora';
import toposort from 'toposort';

import { APIv2Error } from './apiError.js';
import { oraOptions } from './logger.js';
import { allowedMarkdownExtensions, findPages, type PageMetadata } from './readPage.js';
import { categoryUriRegexPattern, parentUriRegexPattern } from './types/index.js';
import { validateFrontmatter } from './validateFrontmatter.js';

type GuidesOrReferenceRequestSchema = PageRequestSchema<'guides' | 'reference'>;

type PageResponseRepresentation = PageResponseSchema<'changelogs' | 'custom_pages' | 'guides' | 'reference'>['data'];

interface BasePushResult {
  filePath: string;

  /**
   * The result of the upload operation.
   * - `created`: The page was created in ReadMe.
   * - `failed`: There was a failure when attempting to create or update the page.
   * - `skipped`: The page was skipped due to no frontmatter data.
   * - `updated`: The page was updated in ReadMe.
   */
  result: 'created' | 'failed' | 'skipped' | 'updated';
  slug: string;
}
interface CreatePushResult extends BasePushResult {
  /**
   * The full response from the ReadMe API. If this is `null`,
   * the page was a dry run and no request was made.
   */
  response: PageResponseRepresentation | null;
  result: 'created';
}
interface FailedPushResult extends BasePushResult {
  error: APIv2Error | Error;
  result: 'failed';
}
interface SkippedPushResult extends BasePushResult {
  result: 'skipped';
}
interface UpdatePushResult extends BasePushResult {
  /**
   * The full response from the ReadMe API. If this is `null`,
   * the page was a dry run and no request was made.
   */
  response: PageResponseRepresentation | null;
  result: 'updated';
}

export type PushResult = CreatePushResult | FailedPushResult | SkippedPushResult | UpdatePushResult;

export interface FullUploadResults {
  created: CreatePushResult[];
  failed: FailedPushResult[];
  skipped: SkippedPushResult[];
  updated: UpdatePushResult[];
}

/**
 * Reads the contents of the specified Markdown or HTML file
 * and creates/updates the corresponding page in ReadMe
 */
async function pushPage(
  this: APIv2PageUploadCommands,
  /** the file data */
  fileData: PageMetadata,
): Promise<PushResult> {
  const { key, 'dry-run': dryRun } = this.flags;
  const { content, filePath, slug } = fileData;
  const data = fileData.data;
  let route = `/${this.route}`;
  // the changelog route is not versioned
  const branch = this.route === 'changelogs' ? null : this.flags.branch;
  if (branch) {
    route = `/branches/${branch}${route}`;
  }

  const headers = new Headers({ authorization: `Bearer ${key}`, 'Content-Type': 'application/json' });

  if (!Object.keys(data).length) {
    this.debug(`No frontmatter attributes found for ${filePath}, not syncing`);
    return { filePath, result: 'skipped', slug };
  }

  let payload: PageRequestSchema<typeof this.route> = {
    ...data,
    content: {
      body: content,
      ...(typeof data.content === 'object' ? data.content : {}),
    },
    slug,
  };

  try {
    // normalize the category uri
    if ('category' in payload && payload.category?.uri) {
      const regex = new RegExp(categoryUriRegexPattern);
      if (!regex.test(payload.category.uri)) {
        let uri = payload.category.uri;
        this.debug(`normalizing category uri ${uri} for ${filePath}`);
        // remove leading and trailing slashes
        uri = uri.replace(/^\/|\/$/g, '');
        payload.category.uri = `/branches/${branch}/categories/${this.route}/${uri}`;
      }
    }

    // normalize the parent uri
    if ('parent' in payload && payload.parent?.uri) {
      const regex = new RegExp(parentUriRegexPattern);
      if (!regex.test(payload.parent.uri)) {
        let uri = payload.parent.uri;
        this.debug(`normalizing parent uri ${uri} for ${filePath}`);
        // remove leading and trailing slashes
        uri = uri.replace(/^\/|\/$/g, '');
        payload.parent.uri = `/branches/${branch}/${this.route}/${uri}`;
      }
    }

    if (this.route === 'custom_pages') {
      const customPagePayload = structuredClone(payload) as PageRequestSchema<typeof this.route>;
      const type = path.extname(filePath).toLowerCase() === '.html' ? 'html' : 'markdown';
      if (typeof customPagePayload.content === 'object' && customPagePayload.content) {
        customPagePayload.content.type = type;
      } else {
        customPagePayload.content = { type };
      }
      payload = customPagePayload;
    }

    const createPage = (): CreatePushResult | Promise<CreatePushResult> => {
      if (dryRun) {
        return { filePath, response: null, result: 'created', slug };
      }

      return this.readmeAPIFetch(
        route,
        { method: 'POST', headers, body: JSON.stringify(payload) },
        { filePath, fileType: 'path' },
      )
        .then(res => this.handleAPIRes(res))
        .then(res => {
          return { filePath, response: res?.data || {}, result: 'created', slug };
        });
    };

    const updatePage = (): Promise<UpdatePushResult> | UpdatePushResult => {
      if (dryRun) {
        return { filePath, response: null, result: 'updated', slug };
      }

      // omits the slug from the PATCH payload since this would lead to unexpected behavior
      delete payload.slug;

      return this.readmeAPIFetch(
        `${route}/${slug}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload),
        },
        { filePath, fileType: 'path' },
      )
        .then(res => this.handleAPIRes(res))
        .then(res => {
          return { filePath, response: res?.data || {}, result: 'updated', slug };
        });
    };

    return this.readmeAPIFetch(`${route}/${slug}`, {
      method: 'GET',
      headers,
    }).then(async res => {
      if (!res.ok) {
        if (res.status !== 404) {
          return this.handleAPIRes(res);
        }
        this.debug(`error retrieving data for ${slug}, creating page`);
        return createPage();
      }
      this.debug(`data received for ${slug}, updating page`);
      return updatePage();
    });
  } catch (e) {
    return { error: e, filePath, result: 'failed', slug };
  }
}

const byParentPage = (
  left: PageMetadata<GuidesOrReferenceRequestSchema>,
  right: PageMetadata<GuidesOrReferenceRequestSchema>,
) => {
  return (right.data.parent?.uri ? 1 : 0) - (left.data.parent?.uri ? 1 : 0);
};

/**
 * Sorts files based on their `parent.uri` attribute. If a file has a `parent.uri` attribute,
 * it will be sorted after the file it references.
 *
 * @see {@link https://github.com/readmeio/rdme/pull/973}
 * @returns An array of sorted PageMetadata objects
 */
function sortFiles(
  files: PageMetadata<GuidesOrReferenceRequestSchema>[],
): PageMetadata<GuidesOrReferenceRequestSchema>[] {
  const filesBySlug = files.reduce<Record<string, PageMetadata<GuidesOrReferenceRequestSchema>>>((bySlug, obj) => {
    // eslint-disable-next-line no-param-reassign
    bySlug[obj.slug] = obj;
    return bySlug;
  }, {});
  const dependencies = Object.values(filesBySlug).reduce<
    [PageMetadata<GuidesOrReferenceRequestSchema>, PageMetadata<GuidesOrReferenceRequestSchema>][]
  >((edges, obj) => {
    if (obj.data.parent?.uri && filesBySlug[obj.data.parent.uri]) {
      edges.push([filesBySlug[obj.data.parent.uri], filesBySlug[obj.slug]]);
    }

    return edges;
  }, []);

  return toposort.array(files, dependencies);
}

/**
 * Takes a path (either to a directory of files or to a single file)
 * and syncs those (either via POST or PATCH) to ReadMe.
 * @returns An array of objects with the results
 */
export default async function syncPagePath(this: APIv2PageUploadCommands): Promise<FullUploadResults> {
  const { path: pathInput } = this.args;
  const { key, 'dry-run': dryRun, 'max-errors': maxErrors, 'skip-validation': skipValidation } = this.flags;

  // check whether or not the project has bidirection syncing enabled
  // if it is, validations must be skipped to prevent frontmatter from being overwritten
  const headers = new Headers({ authorization: `Bearer ${key}` });
  const projectMetadata: ProjectRepresentation = await this.readmeAPIFetch('/projects/me', {
    method: 'GET',
    headers,
  }).then(res => {
    return this.handleAPIRes(res);
  });

  const biDiConnection = projectMetadata?.data?.git?.connection?.status === 'active';
  this.debug(`bi-directional syncing is ${biDiConnection ? 'enabled' : 'disabled'}`);

  const validFileExtensions = [...allowedMarkdownExtensions];
  if (this.route === 'custom_pages') {
    validFileExtensions.push('.html');
  }

  let unsortedFiles = await findPages.call(this, pathInput, validFileExtensions);

  if (skipValidation) {
    this.warn('Skipping pre-upload validation of the Markdown file(s). This is not recommended.');
  } else {
    unsortedFiles = await validateFrontmatter.call(
      this,
      unsortedFiles,
      'Would you like to make these changes and continue with the upload to ReadMe?',
    );
  }

  const uploadSpinner = ora({ ...oraOptions() }).start(
    dryRun
      ? "🎭 Uploading files to ReadMe (but not really because it's a dry run)..."
      : '🚀 Uploading files to ReadMe...',
  );

  const count = { succeeded: 0, failed: 0 };

  // topological sort the files
  const sortedFiles =
    this.route === 'changelogs' || this.route === 'custom_pages'
      ? (unsortedFiles as PageMetadata<PageRequestSchema<typeof this.route>>[])
      : sortFiles((unsortedFiles as PageMetadata<PageRequestSchema<typeof this.route>>[]).sort(byParentPage));

  // push the files to ReadMe
  const rawResults: PromiseSettledResult<PushResult>[] = [];
  for await (const fileData of sortedFiles) {
    try {
      const res = await pushPage.call(this, fileData);
      rawResults.push({
        status: 'fulfilled',
        value: res,
      });
      count.succeeded += 1;
    } catch (err) {
      rawResults.push({
        status: 'rejected',
        reason: err,
      });
      count.failed += 1;
    } finally {
      uploadSpinner.suffixText = `(${count.succeeded} succeeded, ${count.failed} failed)`;
    }
  }

  const results = rawResults.reduce<FullUploadResults>(
    (acc, result, index) => {
      if (result.status === 'fulfilled') {
        const pushResult = result.value;
        if (pushResult.result === 'created') {
          acc.created.push(pushResult);
        } else if (pushResult.result === 'updated') {
          acc.updated.push(pushResult);
        } else if (pushResult.result === 'failed') {
          acc.failed.push(pushResult);
        } else {
          acc.skipped.push(pushResult);
        }
      } else {
        // we're ignoring these ones for now since errors are handled in the catch block
        acc.failed.push({
          error: result.reason,
          filePath: sortedFiles[index].filePath,
          result: 'failed',
          slug: sortedFiles[index].slug,
        });
      }

      return acc;
    },
    { created: [], updated: [], skipped: [], failed: [] },
  );

  uploadSpinner.suffixText = '';

  if (results.failed.length) {
    uploadSpinner.fail(`${uploadSpinner.text} ${results.failed.length} file(s) failed.`);
  } else {
    uploadSpinner.succeed(`${uploadSpinner.text} done!`);
  }

  if (results.created.length) {
    this.log(
      dryRun
        ? `🌱 The following ${results.created.length} page(s) do not currently exist in ReadMe and will be created:`
        : `🌱 Successfully created ${results.created.length} page(s) in ReadMe:`,
    );
    results.created.forEach(({ filePath, slug }) => {
      this.log(`   - ${slug} (${chalk.underline(filePath)})`);
    });
  }

  if (results.updated.length) {
    this.log(
      dryRun
        ? `🔄 The following ${results.updated.length} page(s) already exist in ReadMe and will be updated:`
        : `🔄 Successfully updated ${results.updated.length} page(s) in ReadMe:`,
    );
    results.updated.forEach(({ filePath, slug }) => {
      this.log(`   - ${slug} (${chalk.underline(filePath)})`);
    });
  }

  if (results.skipped.length) {
    this.log(
      dryRun
        ? `⏭️ The following ${results.skipped.length} page(s) will be skipped due to no frontmatter data:`
        : `⏭️ Skipped ${results.skipped.length} page(s) in ReadMe due to no frontmatter data:`,
    );
    results.skipped.forEach(({ filePath, slug }) => {
      this.log(`   - ${slug} (${chalk.underline(filePath)})`);
    });
  }

  if (results.failed.length) {
    this.log(
      dryRun
        ? `🚨 Unable to fetch data about the following ${results.failed.length} page(s):`
        : `🚨 Received errors when attempting to upload ${results.failed.length} page(s):`,
    );
    results.failed.forEach(({ error, filePath }) => {
      let errorMessage = error.message || 'unknown error';
      if (error instanceof APIv2Error && error.response.title) {
        errorMessage = error.response.title;
      }

      this.log(`   - ${chalk.underline(filePath)}: ${errorMessage}`);
    });

    if (results.failed.length >= maxErrors && maxErrors !== -1) {
      if (results.failed.length === 1) {
        throw results.failed[0].error;
      } else {
        const errors = results.failed.map(({ error }) => error);
        throw new AggregateError(
          errors,
          dryRun
            ? `Multiple dry runs failed. To see more detailed errors for a page, run \`${this.config.bin} ${this.id} <path-to-page.md>\` --dry-run.`
            : `Multiple page uploads failed. To see more detailed errors for a page, run \`${this.config.bin} ${this.id} <path-to-page.md>\`.`,
        );
      }
    }
  }

  return results;
}
