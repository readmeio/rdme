const { exec } = require('child_process');
const { isSupportedNodeVersion } = require('../src/lib/nodeVersionUtils');
const pkg = require('../package.json');

describe('bin', () => {
  if (isSupportedNodeVersion(process.version)) {
    it('should show our help screen', async () => {
      expect.assertions(1);

      await new Promise(done => {
        exec(`node ${__dirname}/../bin/rdme`, (error, stdout) => {
          expect(stdout).toContain('a utlity for interacting with ReadMe');
          done();
        });
      });
    });
  } else {
    it('should fail with a message', async () => {
      expect.assertions(1);

      await new Promise(done => {
        exec(`node ${__dirname}/../bin/rdme`, (error, stdout, stderr) => {
          expect(stderr).toContain(
            `We're sorry, this release of rdme does not support your Node version of 12. We support the following versions: ${pkg.engines.node}`
          );
          done();
        });
      });
    });
  }
});
