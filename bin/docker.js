#! /usr/bin/env node
/* eslint-disable no-console */
const { exec } = require('child_process');

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
function runCmd(cmd) {
  const child = exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  });

  child.stdout.on('data', chunk => {
    console.log(chunk.toString());
  });

  child.stderr.on('data', chunk => {
    console.error(chunk.toString());
  });
}

/**
 * Constructs and executes `docker build` command
 */
function build() {
  const metadata = getMetadata();
  // start constructing command
  let cmd = 'docker build --platform linux/amd64';
  // add labels
  Object.keys(metadata.labels).forEach(label => {
    cmd += ` --label "${label}=${metadata.labels[label]}"`;
  });
  // add tags
  metadata.tags.forEach(tag => {
    cmd += ` --tag ${tag}`;
  });
  // point to local Dockerfile
  cmd += ' .';

  console.log(`🐳 🛠️ Running docker build command: ${cmd}`);

  runCmd(cmd);
}

/**
 * Constructs and executes `docker push` command
 */
function push() {
  const metadata = getMetadata();
  const image = metadata.tags[0]?.split(':')?.[0];

  if (!image) {
    console.error(`Unable to extract image name from tag: ${metadata.tags[0]}`);
    return process.exit(1);
  }

  const cmd = `docker push --all-tags ${image}`;
  console.log(`🐳 📌 Running docker push command: ${cmd}`);

  return runCmd(cmd);
}

function run() {
  const cmd = process.argv.slice(2)[0];
  if (cmd === 'build') {
    return build();
  } else if (cmd === 'push') {
    return push();
  }

  console.error("Docker command must be 'build' or 'push'.");
  return process.exit(1);
}

run();
