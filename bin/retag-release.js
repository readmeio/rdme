/* eslint-disable no-console */
module.exports = async (github, context) => {
  const { owner, repo } = context.repo;
  const oldTag = context.payload.release.tag_name;
  if (!oldTag.match(/^[0-9]+\.[0-9]+\.[0-9]+$/)) {
    console.log('Not retagging this release: This script will only retag releases that use');
    console.log(`semantic versioning, like "1.2.3", but this release's tag is "${oldTag}".`);
    return {};
  }
  const newTag = `v${oldTag}`;
  console.log(`Retagging release "${oldTag}" as "${newTag}".`);

  const oldRef = await github.rest.git.getRef({
    owner,
    repo,
    ref: `tags/${oldTag}`,
  });
  if (oldRef.status < 200 || oldRef.status >= 400) {
    console.log(oldRef);
    throw new Error(`GitHub API call returned HTTP status code ${oldRef.status}`);
  }
  const sha = oldRef.data.object.sha;
  console.log(`Found tag "${oldTag}"; commit hash is ${sha}`);

  console.log(`Creating tag "${newTag}" pointing to commit hash ${sha}...`);
  const newRef = await github.rest.git.createRef({
    owner,
    repo,
    ref: `refs/tags/${newTag}`,
    sha,
  });
  if (newRef.status < 200 || newRef.status >= 400) {
    console.log(newRef);
    throw new Error(`GitHub API call returned HTTP status code ${newRef.status}`);
  }
  console.log('Successfully retagged this release.');
  return {
    original_tag: oldTag,
    new_tag: newTag,
    sha,
  };
};
