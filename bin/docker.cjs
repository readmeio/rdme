#! /usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable import/no-commonjs */
/* eslint-disable @typescript-eslint/no-var-requires */
const util = require('util'); // eslint-disable-line unicorn/import-style
const execFile = util.promisify(require('child_process').execFile);

/**
 * Retrieves and parses the docker image metadata
 * @see {@link https://github.com/docker/metadata-action}
 * @see {@link https://gist.github.com/kanadgupta/801c8335e7e2e3d80463c34bdd41c7e6}
 */
function getMetadata() {
  try {
    // See here for an example JSON output: https://gist.github.com/kanadgupta/801c8335e7e2e3d80463c34bdd41c7e6
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
async function runDockerCmd(args) {
  // Promise-based approach grabbed from here: https://stackoverflow.com/a/63027900
  const execCmd = execFile('docker', args);
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
  const { labels, tags } = getMetadata();
  try {
    // start constructing build command
    const buildArgs = ['build', '--platform', 'linux/amd64'];
    // add labels
    Object.keys(labels).forEach(label => {
      buildArgs.push('--label', `${label}=${labels[label]}`);
    });
    // add tags
    tags.forEach(tag => {
      buildArgs.push('--tag', tag);
    });
    // point to local Dockerfile
    buildArgs.push('.');

    // Strips tag from image so we can use the --all-tags flag in the push command
    const imageWithoutTag = tags[0]?.split(':')?.[0];

    if (!imageWithoutTag) {
      console.error(`Unable to separate image name from tag: ${tags[0]}`);
      return process.exit(1);
    }

    const pushArgs = ['push', '--all-tags', imageWithoutTag];

    console.log(`🐳 🛠️  Running docker build command: docker ${buildArgs.join(' ')}`);

    await runDockerCmd(buildArgs);

    console.log(`🐳 📌 Running docker push command: docker ${pushArgs.join(' ')}`);

    await runDockerCmd(pushArgs);
  } catch (e) {
    console.error('Error running Docker script!');
    console.error(e);
    return process.exit(1);
  }

  console.log('🐳 All done!');
  return process.exit(0);
}

run();
