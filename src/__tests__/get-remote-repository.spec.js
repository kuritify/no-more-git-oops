const sut = require('../get-remote-repository');

const os = require('os');

describe('getRemoteRepository', () => {
  it('positive-case', async () => {
    const remote = await sut(__dirname);
    expect(remote.origin).toMatch(/github[^.]*[.]com/);
    expect(remote.owner).toBe('kuritify');
    expect(remote.repo).toBe('no-more-git-oops');
  });
  it('negative-case', async () => {
    const remote = await sut(os.tmpdir());
    expect(remote).toBeUndefined();
  })
});
