#! /usr/bin/env node
import fs from 'node:fs/promises';

// eslint-disable-next-line import/no-extraneous-dependencies
import jsYaml from 'js-yaml';

import pkg from '../package.json' assert { type: 'json' };

/**
 * Updates our `action.yml` file so it properly points to
 * the correct docker image
 * @see {@link https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#runs-for-docker-container-actions}
 */
async function setActionImage() {
  // Grabs Docker image URL from action.yml, updates version value,
  // and writes changes back to action.yml file
  const actionFile = await fs.readFile('./action.yml', 'utf-8');
  const actionObj = jsYaml.load(actionFile);
  const imageURL = new URL(actionObj.runs.image);
  imageURL.pathname = imageURL.pathname.replace(/:.*/g, `:${pkg.version}`);
  actionObj.runs.image = imageURL.toString();
  const actionYaml = jsYaml.dump(actionObj, { lineWidth: -1 });
  await fs.writeFile('./action.yml', actionYaml, { encoding: 'utf-8' });
  // eslint-disable-next-line no-console
  console.log('action.yml file successfully updated!');
}

setActionImage();
