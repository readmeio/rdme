const assert = require('assert');

const utils = require('../utils');

describe('utils', () => {
  describe('#config()', () => {
    it('loads main config', () => {
      const config = utils.config('config');
      assert(Object.keys(config).length > 0);
      assert.notEqual(config, 'test');
    });

    it.skip('loads test config', () => {
      const config = utils.config('test');
      assert(Object.keys(config).length > 0);
      assert.equal(config.env, 'test');
    });
  });
});
