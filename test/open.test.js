const assert = require('assert');
const config = require('config');

const configStore = require('../utils/configstore');

const open = require('../cli').bind(null, 'open');

describe('open command', () => {
  it('should error if no project provided', done => {
    configStore.delete('project');

    open([], {}).catch(err => {
      assert.equal(err.message, `Please login using ${config.cli} login`);
      return done();
    });
  });

  it('should open the project', done => {
    configStore.set('project', 'subdomain');

    function mockOpen(url) {
      assert.equal(url, 'https://subdomain.readme.io');
      done();
      return Promise.resolve();
    }

    open([], { mockOpen });
  });
});
