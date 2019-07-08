const assert = require('assert');
// const jest = require('jest');
const Enquirer = require('enquirer');
const promptHandler = require('../lib/prompts');

// const down = { sequence: '\u001b[B', name: 'down', code: '[B' };
const versionlist = [
  {
    version: '1',
    _id: '32',
  },
];
//
// const opts = {
//   version: '1',
//   codename: 'test',
//   fork: '1.0.0',
//   main: true,
//   beta: true,
//   isPublic: true
// };

describe('prompt test bed', () => {
  let enquirer;

  beforeEach(() => {
      enquirer = new Enquirer();
  });

  describe('generatePrompts()', () => {
    it('should return a version if update is selected', async () => {
      enquirer.on('prompt', async prompt => {
        await prompt.submit();
        // if (prompt.name === 'option') {
        //   prompt.submit()
        // } else {
        //   prompt.value = 'red';
        //   prompt.submit();
        // }
      });

      // return enquirer.prompt([{
      //   type: 'input',
      //   name: 'color',
      //   message: 'Favorite color?'
      // }]).then(answers => console.log(answers));


      return enquirer.prompt(promptHandler.generatePrompts(versionlist))
        .then(answers => console.log(answers))

      // const promptCall = await
      // assert.equal(promptCall.versionSelection, '1');
      // done();
    });

    // it('should return a create option if selected', async () => {
    //   const prompt = promptHandler.generatePrompts(versionlist);
    //
    //   prompt.once('run', async () => {
    //     await prompt.keypress(null, down);
    //     await prompt.submit();
    //   });
    //
    //   const answer = await prompt.run();
    //   assert.equal(answer.option, 'create');
    // });
  });

  // describe('createVersionPrompt()', () => {
  //   it('should not use input if the prompt is meant for creating a version', async () => {
  //     const options = { main: true, beta: true };
  //     const prompt = promptHandler.createVersionPrompt(versionlist, options, false);
  //
  //     prompt.once('run', async () => {
  //       await prompt.submit();
  //     });
  //
  //     const response = {};
  //     const answer = await prompt.run();
  //     assert.equal(answer, response);
  //   });
  // });
});
