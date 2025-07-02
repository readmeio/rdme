#! /usr/bin/env node

// @ts-check
import fs from 'node:fs/promises';
import path from 'node:path';

import prettier from 'prettier';

const files = [
  {
    // JSON Schema for GitHub Actions Workflow file
    // See: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
    filePath: '__tests__/helpers/github-workflow-schema.json',
    url: 'https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/github-workflow.json',
  },
];

/**
 * Handles the checks and refreshes for our JSON Schema Store files.
 *
 * @see {@link https://www.schemastore.org/json/}
 */
async function refreshSchemas() {
  const isUpdate = process.argv.includes('--update');
  // grab prettier config from repo root
  const prettierConfig = await prettier.resolveConfig(path.join(new URL('.', import.meta.url).pathname, '.'));
  try {
    await Promise.all(
      files.map(async file => {
        const rawFile = await fetch(file.url, {}).then(res => {
          if (!res.ok) throw new Error(`Received ${res.status} when attempting to fetch ${file.url}`);
          return res.json();
        });

        const formattedFile = await prettier.format(JSON.stringify(rawFile), { parser: 'json', ...prettierConfig });

        if (isUpdate) {
          await fs.writeFile(file.filePath, formattedFile);
        } else {
          const currentFile = await fs.readFile(file.filePath, { encoding: 'utf-8' });
          if (currentFile !== formattedFile) {
            throw new Error(`${file.filePath} is outdated! Run \`npm run schemas:write\` to update.`);
          }
        }
      }),
    );

    console.log(isUpdate ? 'JSON Schema files updated!' : 'JSON Schema files are up-to-date!');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

refreshSchemas();
