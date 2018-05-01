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

  it('command not found', done => {
    console.error = message => {
      assert(message.includes('Command not found'));
      return done();
    };
    cli('notARealCommand');
  });
});
