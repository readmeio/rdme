#! /usr/bin/env node

// @ts-check
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';

const files = [
  {
    // JSON Schema for GitHub Actions Workflow file
    // See: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
    filePath: 'test/helpers/github-workflow-schema.json',
    url: 'https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/github-workflow.json',
  },
];

function getObjectHash(data) {
  return createHash('sha1')
    .update(Buffer.from(JSON.stringify(data), 'utf8'))
    .digest('hex');
}

/**
 * Handles the checks and refreshes for our JSON Schema Store files.
 *
 * @see {@link https://www.schemastore.org/json/}
 */
async function refreshSchemas() {
  const isUpdate = process.argv.includes('--update');

  try {
    await Promise.all(
      files.map(async file => {
        const rawFile = await fetch(file.url, {}).then(res => {
          if (!res.ok) throw new Error(`Received ${res.status} when attempting to fetch ${file.url}`);
          return res.json();
        });

        if (isUpdate) {
          await fs.writeFile(file.filePath, JSON.stringify(rawFile));
        } else {
          const currentFile = await fs.readFile(file.filePath, { encoding: 'utf-8' });
          const currentData = JSON.parse(currentFile);
          if (getObjectHash(currentData) !== getObjectHash(rawFile)) {
            throw new Error(`${file.filePath} is outdated! Run \`npm run schemas:write\` to update.`);
          }
        }
      }),
    );

    // oxlint-disable-next-line no-console -- This is in an executable.
    console.log(isUpdate ? 'JSON Schema files updated!' : 'JSON Schema files are up-to-date!');
    process.exit(0);
  } catch (e) {
    // oxlint-disable-next-line no-console -- This is in an executable.
    console.error(e.message);
    process.exit(1);
  }
}

await refreshSchemas();
