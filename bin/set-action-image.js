#! /usr/bin/env node
const fs = require('fs/promises');

const core = require('@actions/core');
// eslint-disable-next-line import/no-extraneous-dependencies
const jsYaml = require('js-yaml');

/**
 * Updates our `action.yml` file so it properly points to
 * the correct docker image, and also sets a version output
 * for usage in subsequent workflow Docker image building steps
 * @see {@link https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#runs-for-docker-container-actions}
 * @see {@link https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter}
 */
async function setActionImage() {
  // Grab version from args
  const newVersion = process.argv.slice(2)?.[0];
  if (!newVersion) {
    // eslint-disable-next-line no-console
    console.error('Missing version in setActionImage()');
    process.exit(1);
  }
  // Set GitHub Output
  core.setOutput('newVersion', newVersion);
  // Grabs Docker image URL from action.yml, updates version value,
  // and writes changes back to action.yml file
  const actionFile = await fs.readFile('./action.yml', 'utf-8');
  const actionObj = jsYaml.load(actionFile);
  const imageURL = new URL(actionObj.runs.image);
  imageURL.pathname = imageURL.pathname.replace(/:.*/g, `:${newVersion}`);
  actionObj.runs.image = imageURL.toString();
  const actionYaml = jsYaml.dump(actionObj, { lineWidth: -1 });
  await fs.writeFile('./action.yml', actionYaml, { encoding: 'utf-8' });
  // eslint-disable-next-line no-console
  console.log('action.yml file successfully updated!');
}

setActionImage();
