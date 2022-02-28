const Enquirer = require('enquirer');

function disablePromptsInCI(answers = {}) {
  return enquirer => {
    const prompt = enquirer.prompt.bind(enquirer);
    const context = { ...enquirer.answers, ...answers };

    // eslint-disable-next-line no-param-reassign
    enquirer.prompt = async questions => {
      const list = [].concat(questions || []);

      // Purposefully loading `ci-info` here so we can adequately test it.
      const ci = require('ci-info'); // eslint-disable-line global-require
      if (!ci.isCI) {
        // If we aren't in a CI environment then we shouldn't look for unanswered questions.
        return prompt(list);
      }

      const missingArgs = [];

      (questions || []).forEach(item => {
        // Confirm-style questions are always optional!
        if (item.type !== 'confirm') {
          const value = context[item.name];
          if (value === undefined && !item.skip()) {
            missingArgs.push(item.name);
          }
        }
      });

      if (missingArgs.length) {
        // prettier-ignore
        throw new Error(
          `Oops! We noticed you're running this command within a ${ci.name} environment, but we have a few questions we were going to ask you! We'll need the following arguments for your command to run question-free: ${missingArgs.join(',')}`
        );
      }

      return prompt(list);
    };
  };
}

module.exports = function (answers = {}, questions = []) {
  const enquirer = new Enquirer();

  enquirer.use(disablePromptsInCI(answers));

  return enquirer.prompt(questions).catch(err => {
    // If the Enquirer promise was rejected without an error then the user killed an open prompt so
    // we should abide by their wishes and bail out.
    if (!err) process.exit(0);
    throw err;
  });
};
