/**
 * Retrieves the remote repository details for a given directory.
 *
 * @param {string} gitBaseDir - The base directory where the git repository is located.
 * @returns {Promise<{origin: string, owner: string, repo: string} | undefined>}
 *          An object containing the origin, owner, and repository name if found, otherwise undefined.
 */
module.exports = async function getRemoteRepository (gitBaseDir) {
  const {simpleGit} = await import('simple-git');

    const simpleGitIns = simpleGit({baseDir: gitBaseDir});

  let remotes = undefined;
  try {
    remotes = await simpleGitIns.getRemotes(true);
  } catch (err) {
    if (/not a git repositor/.test(err.message)) {
      return undefined;
    }
  }

  if (!remotes || remotes.length === 0) {
    return undefined;
  }
  let remote = remotes.find(remote => remote.name === 'origin');
  if (remote) {
    if (remotes.length === 1) {
      remote = remotes[0];
    }
    const match = remote.refs.fetch.match(/(?:git@|https:\/\/)([^:/]+)[:/]([^/]+)\/(.+?)(?:\.git)?$/);
    if (match) {
      const [, origin, owner, repo] = match;
      return { origin, owner, repo };
    }
  }
  return undefined;
}
