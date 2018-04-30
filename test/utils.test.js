var assert = require('assert');

var path = require('path');

describe('utils.js', function() {
  var utils = require('../utils');
  describe('#findSwagger()', function() {

    it.skip('find a YAML file', function(done) {
      utils.findSwagger(function(err, swagger, file) {
        if(err) return done(err);
        assert(file.endsWith('PetStore.yaml'))
        assert.equal('2.0', swagger.swagger);
        done();
      }, {
        dir: path.join(__dirname, 'fixtures', 'yaml')
      });
    });

    it.skip('find a JSON file', function(done) {
      utils.findSwagger(function(err, swagger, file) {
        if(err) return done(err);
        assert(file.endsWith('swagger.json'))
        assert.equal('2.0', swagger.swagger);
        done();
      }, {
        dir: path.join(__dirname, 'fixtures', 'json')
      });
    });

    it('loads main config', function() {
      var config = utils.config('config');
      assert(Object.keys(config).length > 0)
      assert.notEqual(config, 'test');
    });

    it.skip('loads test config', function() {
      var config = utils.config('test');
      assert(Object.keys(config).length > 0)
      assert.equal(config.env, 'test');
    });

  });
});

describe('api.js', function() {
  var api = require('../api');
  beforeEach(function() {
    var log = console.log;
    this.sinon.stub(console, 'log', function() {
      return log.apply(log, arguments);
    });
  });

  afterEach(function() {
    console.log.restore();
  });

  describe('#api()', function() {
    it.skip('action not found', function() {
      api.api('notARealAction');
      expect(console.log).to.have.been.calledWithMatch('not found');
    });
  });
});
