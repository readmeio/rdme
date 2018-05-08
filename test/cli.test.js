const assert = require('assert');

const cli = require('../cli');

describe('cli', () => {
  let error;
  beforeAll(() => {
    error = { console };
  });

  afterAll(() => {
    console.error = error;
  });

  it('command not found', done =>
    cli('notARealCommand').catch(e => {
      assert.equal(e.message.includes('Command not found'), true)
      return done();
    }));

  });
});
