const assert = require('assert');
const path = require('path');

const utils = require('../utils');

describe('utils.js', () => {
  describe('#findSwagger()', () => {
    it.skip('find a YAML file', done => {
      utils.findSwagger(
        (err, swagger, file) => {
          if (err) return done(err);
          assert(file.endsWith('PetStore.yaml'));
          assert.equal('2.0', swagger.swagger);
          return done();
        },
        {
          dir: path.join(__dirname, 'fixtures', 'yaml'),
        },
      );
    });

    it.skip('find a JSON file', done => {
      utils.findSwagger(
        (err, swagger, file) => {
          if (err) return done(err);
          assert(file.endsWith('swagger.json'));
          assert.equal('2.0', swagger.swagger);
          return done();
        },
        {
          dir: path.join(__dirname, 'fixtures', 'json'),
        },
      );
    });

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
