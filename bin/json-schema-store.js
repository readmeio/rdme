#! /usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs/promises');

const fetch = require('node-fetch');
const prettier = require('prettier');

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
  const prettierConfig = await prettier.resolveConfig();
  try {
    await Promise.all(
      files.map(async file => {
        const rawFile = await fetch(file.url, {}).then(res => {
          if (!res.ok) throw new Error(`Received ${res.status} when attempting to fetch ${file.url}`);
          return res.json();
        });

        const formattedFile = prettier.format(JSON.stringify(rawFile), { parser: 'json', ...prettierConfig });

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
    // eslint-disable-next-line no-console
    console.log(isUpdate ? 'JSON Schema files updated!' : 'JSON Schema files are up-to-date!');
    process.exit(0);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e.message);
    process.exit(1);
  }
}

refreshSchemas();
