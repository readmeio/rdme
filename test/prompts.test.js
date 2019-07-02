const assert = require('assert');
const promptHandler = require('../lib/prompts');

const versionlist = [
  {
    version: '1',
    _id: '32',
  },
];

describe('generatePrompts()', () => {
  it('should create an array of objects based on provided version list', () => {
    const res = promptHandler.generatePrompts(versionlist);
    console.log(res[1].choices);
    assert.equal(res[1].choices[0].title, '1');
  });
});
