import type { Response } from 'simple-git';

/**
 * Creates a Jest mock function for testing `git.remote`
 * @param remote remote to return (usually `origin`)
 * @param remoteUrl git URL for the given remote
 * @param defaultBranch the HEAD branch
 */
export default function getGitRemoteMock(
  remote = 'origin',
  remoteUrl = 'https://github.com/readmeio/rdme.git',
  defaultBranch = 'main'
) {
  return jest.fn(arr => {
    // first call (used to grab remote for usage in subsequent commands)
    if (!arr.length) {
      if (!remote) return Promise.reject(new Error('Bad mock uh oh')) as unknown as Response<string>;
      return Promise.resolve(remote) as unknown as Response<string>;
    }
    // second call (used to grab default branch)
    if (arr.length === 2 && arr[0] === 'show' && arr[1] === remote) {
      if (remote === 'bad-remote') {
        return Promise.reject(
          new Error(`fatal: unable to access '${remoteUrl}': Could not resolve host: ${remoteUrl}`)
        ) as unknown as Response<string>;
      }
      if (!defaultBranch) return Promise.reject(new Error('Bad mock uh oh')) as unknown as Response<string>;
      return Promise.resolve(`* remote origin
  Fetch URL: ${remoteUrl}
  Push  URL: ${remoteUrl}
  HEAD branch: ${defaultBranch}
`) as unknown as Response<string>;
    }

    // third call (used to grab remote URLs)
    if (arr.length === 1 && arr[0] === '-v') {
      if (!remoteUrl) return Promise.reject(new Error('Bad mock uh oh')) as unknown as Response<string>;
      return Promise.resolve(`origin  ${remoteUrl} (fetch)
origin  ${remoteUrl} (push)
    `) as unknown as Response<string>;
    }

    return Promise.reject(new Error('Bad mock uh oh')) as unknown as Response<string>;
  });
}
