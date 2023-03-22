#! /usr/bin/env node
/* eslint-disable no-console */
const util = require('util'); // eslint-disable-line unicorn/import-style
const exec = util.promisify(require('child_process').exec);

/**
 * Retrieves and parses the docker image metadata
 * @see {@link https://github.com/docker/metadata-action}
 */
function getMetadata() {
  try {
    const raw = process.env.DOCKER_METADATA_OUTPUT_JSON;
    const metadata = JSON.parse(raw);
    if (!Object.keys(metadata.labels || {})?.length) {
      throw new Error('Invalid shape (missing labels data)');
    }
    if (!metadata?.tags?.length) {
      throw new Error('Invalid shape (missing tags data)');
    }
    return metadata;
  } catch (e) {
    console.error('Error retrieving docker metadata:', e.message);
    return process.exit(1);
  }
}

/**
 * Runs command and logs all output
 */
async function runCmd(cmd) {
  // https://stackoverflow.com/a/63027900
  const execCmd = exec(cmd);
  const child = execCmd.child;

  child.stdout.on('data', chunk => {
    console.log(chunk.toString());
  });

  child.stderr.on('data', chunk => {
    console.error(chunk.toString());
  });

  const { stdout, stderr } = await execCmd;

  if (stdout) console.log(stdout);
  if (stderr) console.error(stdout);
}

/**
 * Constructs and executes `docker build` and `docker push` commands
 */
async function run() {
  const metadata = getMetadata();
  try {
    // start constructing build command
    let buildCmd = 'docker build --platform linux/amd64';
    // add labels
    Object.keys(metadata.labels).forEach(label => {
      buildCmd += ` --label "${label}=${metadata.labels[label]}"`;
    });
    // add tags
    metadata.tags.forEach(tag => {
      buildCmd += ` --tag ${tag}`;
    });
    // point to local Dockerfile
    buildCmd += ' .';

    // Strips tag from image so we can use the --all-tags flag in the push command
    const imageWithoutTag = metadata.tags[0]?.split(':')?.[0];

    if (!imageWithoutTag) {
      console.error(`Unable to separate image name from tag: ${metadata.tags[0]}`);
      return process.exit(1);
    }

    const pushCmd = `docker push --all-tags ${imageWithoutTag}`;

    console.log(`🐳 🛠️ Running docker build command: ${buildCmd}`);

    await runCmd(buildCmd);

    console.log(`🐳 📌 Running docker push command: ${pushCmd}`);

    await runCmd(pushCmd);
  } catch (e) {
    console.error('Error running Docker script!');
    console.error(e);
    return process.exit(1);
  }

  console.log('🐳 All done!');
  return process.exit(0);
}

run();
