import type { PageMetadata } from './readPage.js';
import type { GuidesRequestRepresentation, ProjectRepresentation } from './types/index.js';
import type DocsMigrateCommand from '../commands/docs/migrate.js';
import type DocsUploadCommand from '../commands/docs/upload.js';

import fs from 'node:fs/promises';
import path from 'node:path';

import chalk from 'chalk';
import ora from 'ora';
import toposort from 'toposort';

import { APIv2Error } from './apiError.js';
import { fix, writeFixes } from './frontmatter.js';
import isCI from './isCI.js';
import { oraOptions } from './logger.js';
import promptTerminal from './promptWrapper.js';
import readdirRecursive from './readdirRecursive.js';
import { fetchMappings, fetchSchema } from './readmeAPIFetch.js';
import readPage from './readPage.js';
import { categoryUriRegexPattern, parentUriRegexPattern } from './types/index.js';

/**
 * Commands that use this file for syncing Markdown via APIv2.
 *
 * Note that the `changelogs` command is not included here
 * because it is backed by APIv1.
 */
export type CommandsThatSyncMarkdown = DocsMigrateCommand | DocsUploadCommand;

type PageRepresentation = GuidesRequestRepresentation;

export interface FailedPushResult {
  error: APIv2Error | Error;
  filePath: string;
  result: 'failed';
  slug: string;
}

export type PushResult =
  | FailedPushResult
  | {
      filePath: string;
      response: PageRepresentation | null;
      result: 'created' | 'skipped' | 'updated';
      slug: string;
    };

/**
 * Reads the contents of the specified Markdown or HTML file
 * and creates/updates the corresponding page in ReadMe
 */
async function pushPage(
  this: CommandsThatSyncMarkdown,
  /** the file data */
  fileData: PageMetadata,
): Promise<PushResult> {
  const { key, 'dry-run': dryRun, version } = this.flags;
  const { content, filePath, slug } = fileData;
  const data = fileData.data;
  let route = `/${this.route}`;
  if (version) {
    route = `/versions/${version}${route}`;
  }

  const headers = new Headers({ authorization: `Bearer ${key}`, 'Content-Type': 'application/json' });

  if (!Object.keys(data).length) {
    this.debug(`No frontmatter attributes found for ${filePath}, not syncing`);
    return { response: null, filePath, result: 'skipped', slug };
  }

  const payload: PageRepresentation = {
    ...data,
    content: {
      body: content,
      ...(typeof data.content === 'object' ? data.content : {}),
    },
    slug,
  };

  try {
    // normalize the category uri
    if (payload.category?.uri) {
      const regex = new RegExp(categoryUriRegexPattern);
      if (!regex.test(payload.category.uri)) {
        let uri = payload.category.uri;
        this.debug(`normalizing category uri ${uri} for ${filePath}`);
        // remove leading and trailing slashes
        uri = uri.replace(/^\/|\/$/g, '');
        payload.category.uri = `/versions/${version}/categories/${this.route}/${uri}`;
      }
    }

    // normalize the parent uri
    if (payload.parent?.uri) {
      const regex = new RegExp(parentUriRegexPattern);
      if (!regex.test(payload.parent.uri)) {
        let uri = payload.parent.uri;
        this.debug(`normalizing parent uri ${uri} for ${filePath}`);
        // remove leading and trailing slashes
        uri = uri.replace(/^\/|\/$/g, '');
        payload.parent.uri = `/versions/${version}/${this.route}/${uri}`;
      }
    }

    const createPage = (): Promise<PushResult> | PushResult => {
      if (dryRun) {
        return { filePath, result: 'created', response: null, slug };
      }

      return this.readmeAPIFetch(
        route,
        { method: 'POST', headers, body: JSON.stringify(payload) },
        { filePath, fileType: 'path' },
      )
        .then(res => this.handleAPIRes(res))
        .then(res => {
          return { filePath, result: 'created', response: res, slug };
        });
    };

    const updatePage = (): Promise<PushResult> | PushResult => {
      if (dryRun) {
        return { filePath, result: 'updated', response: null, slug };
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
          return { filePath, result: 'updated', response: res, slug };
        });
    };

    return this.readmeAPIFetch(`${route}/${slug}`, {
      method: 'HEAD',
      headers,
    }).then(async res => {
      await this.handleAPIRes(res, true);
      if (!res.ok) {
        if (res.status !== 404) throw new APIv2Error(res);
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

const byParentPage = (left: PageMetadata<PageRepresentation>, right: PageMetadata<PageRepresentation>) => {
  return (right.data.parent?.uri ? 1 : 0) - (left.data.parent?.uri ? 1 : 0);
};

/**
 * Sorts files based on their `parent.uri` attribute. If a file has a `parent.uri` attribute,
 * it will be sorted after the file it references.
 *
 * @see {@link https://github.com/readmeio/rdme/pull/973}
 * @returns An array of sorted PageMetadata objects
 */
function sortFiles(files: PageMetadata<PageRepresentation>[]): PageMetadata<PageRepresentation>[] {
  const filesBySlug = files.reduce<Record<string, PageMetadata<PageRepresentation>>>((bySlug, obj) => {
    // eslint-disable-next-line no-param-reassign
    bySlug[obj.slug] = obj;
    return bySlug;
  }, {});
  const dependencies = Object.values(filesBySlug).reduce<
    [PageMetadata<PageRepresentation>, PageMetadata<PageRepresentation>][]
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
export default async function syncPagePath(this: CommandsThatSyncMarkdown) {
  const { path: pathInput }: { path: string } = this.args;
  const { key, 'dry-run': dryRun, 'skip-validation': skipValidation } = this.flags;

  const allowedFileExtensions = ['.markdown', '.md', '.mdx'];

  const stat = await fs.stat(pathInput).catch(err => {
    if (err.code === 'ENOENT') {
      throw new Error("Oops! We couldn't locate a file or directory at the path you provided.");
    }
    throw err;
  });

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
  if (biDiConnection && !skipValidation) {
    throw new Error(
      "Bi-directional syncing is enabled for this project. Uploading these docs will overwrite what's currently synced from Git. To proceed with the upload, re-run this command with the `--skip-validation` flag.",
    );
  }

  if (skipValidation) {
    if (biDiConnection) {
      this.warn(
        "Bi-directional syncing is enabled for this project. Uploading these docs will overwrite what's currently synced from Git.",
      );
    } else {
      this.warn('Skipping pre-upload validation of the Markdown file(s). This is not recommended.');
    }
  }

  let files: string[];

  if (stat.isDirectory()) {
    const fileScanningSpinner = ora({ ...oraOptions() }).start(
      `🔍 Looking for Markdown files in the \`${pathInput}\` directory...`,
    );
    // Filter out any files that don't match allowedFileExtensions
    files = readdirRecursive(pathInput).filter(file =>
      allowedFileExtensions.includes(path.extname(file).toLowerCase()),
    );

    if (!files.length) {
      fileScanningSpinner.fail(`${fileScanningSpinner.text} no files found.`);
      throw new Error(
        `The directory you provided (${pathInput}) doesn't contain any of the following file extensions: ${allowedFileExtensions.join(
          ', ',
        )}.`,
      );
    }

    fileScanningSpinner.succeed(`${fileScanningSpinner.text} ${files.length} file(s) found!`);
  } else {
    const fileExtension = path.extname(pathInput).toLowerCase();
    if (!allowedFileExtensions.includes(fileExtension)) {
      throw new Error(
        `Invalid file extension (${fileExtension}). Must be one of the following: ${allowedFileExtensions.join(', ')}`,
      );
    }

    files = [pathInput];
  }

  this.debug(`number of files: ${files.length}`);

  let unsortedFiles = files.map(file => readPage.call(this, file));

  if (!skipValidation) {
    const validationSpinner = ora({ ...oraOptions() }).start('🔬 Validating frontmatter data...');

    const schema = await fetchSchema.call(this);
    const mappings = await fetchMappings.call(this);

    // validate the files, prompt user to fix if necessary
    const validationResults = unsortedFiles.map(file => {
      this.debug(`validating frontmatter for ${file.filePath}`);
      return fix.call(this, file.data, schema, mappings);
    });

    const filesWithIssues = validationResults.filter(result => result.hasIssues);
    const filesWithFixableIssues = filesWithIssues.filter(result => result.changeCount);
    const filesWithUnfixableIssues = filesWithIssues.filter(result => result.unfixableErrors.length);

    if (filesWithIssues.length) {
      validationSpinner.warn(`${validationSpinner.text} issues found in ${filesWithIssues.length} file(s).`);
      if (filesWithFixableIssues.length) {
        if (isCI()) {
          throw new Error(
            `${filesWithIssues.length} file(s) have issues that should be fixed before uploading to ReadMe. Please run \`${this.config.bin} ${this.id} ${pathInput} --dry-run\` in a non-CI environment to fix them.`,
          );
        }

        const { confirm } = await promptTerminal([
          {
            type: 'confirm',
            name: 'confirm',
            message: `${filesWithFixableIssues.length} file(s) have issues that can be fixed automatically. Would you like to make these changes and continue with the upload to ReadMe?`,
          },
        ]);

        if (!confirm) {
          throw new Error('Aborting upload due to user input.');
        }

        const updatedFiles = unsortedFiles.map((file, index) => {
          return writeFixes.call(this, file, validationResults[index].updatedData);
        });

        unsortedFiles = updatedFiles;
      }

      // also inform the user if there are files with issues that can't be fixed
      if (filesWithUnfixableIssues.length) {
        this.warn(
          `${filesWithUnfixableIssues.length} file(s) have issues that cannot be fixed automatically. The upload will proceed but we recommend addressing these issues. Please get in touch with us at support@readme.io if you need a hand.`,
        );
      }
    } else {
      validationSpinner.succeed(`${validationSpinner.text} no issues found!`);
    }
  }

  const uploadSpinner = ora({ ...oraOptions() }).start(
    dryRun
      ? "🎭 Uploading files to ReadMe (but not really because it's a dry run)..."
      : '🚀 Uploading files to ReadMe...',
  );

  // topological sort the files
  const sortedFiles = sortFiles((unsortedFiles as PageMetadata<PageRepresentation>[]).sort(byParentPage));

  // push the files to ReadMe
  const rawResults = await Promise.allSettled(sortedFiles.map(async fileData => pushPage.call(this, fileData)));

  const results = rawResults.reduce<{
    created: PushResult[];
    failed: FailedPushResult[];
    skipped: PushResult[];
    updated: PushResult[];
  }>(
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

  return results;
}
