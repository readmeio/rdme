import fs from 'fs';

import prompts from 'prompts';

import ValidateCommand from '../../src/cmds/validate';
import createGHAHelper from '../../src/lib/createGHA';

const validateCommand = new ValidateCommand();

describe('#createGHA', () => {
  // eslint-disable-next-line no-underscore-dangle
  let _Date;

  beforeEach(() => {
    // global Date override to handle timestamp generation
    // stolen from here: https://github.com/facebook/jest/issues/2234#issuecomment-294873406
    const DATE_TO_USE = new Date('2022');
    _Date = Date;
    // @ts-expect-error we're just overriding the constructor for tests,
    // no need to construct everything
    global.Date = jest.fn(() => DATE_TO_USE);
  });

  afterEach(() => {
    global.Date = _Date;
  });

  it('should test GHA creation workflow', async () => {
    prompts.inject([true, 'main', 'rdme-validate']);

    let yamlOutput;

    fs.writeFileSync = jest.fn((f, d) => {
      yamlOutput = d;
      return true;
    });

    await expect(
      // @ts-expect-error need to figure out a better way to digest opts
      createGHAHelper('validate', validateCommand.args, { spec: 'petstore.json' })
    ).resolves.toMatchSnapshot();

    expect(yamlOutput).toMatchSnapshot();
    expect(fs.writeFileSync).toHaveBeenCalledWith('.github/workflows/rdme-validate.yaml', expect.any(String));
  });
});
