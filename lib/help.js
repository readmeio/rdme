// TODO check this?
const glob = require('glob');
const path = require('path');
const _ = require('lodash');

exports.category = 'basic';
exports.desc = 'Learn what you can do with this tool';
exports.weight = 2;

function pad(text) {
  return text.padEnd(15);
}

exports.run = function(config) {
  console.log('');
  console.log(`Usage: ${config.cli} <command> [arguments]`);
  const files = glob.sync(path.join(__dirname, '*'));

  const categories = {
    basic: {
      desc: 'Commands for getting started',
      commands: [],
    },
    services: {
      desc: `Hosted third-party services ${'(Will post to the Internet)'.grey}`,
      commands: [],
    },
  };

  _.each(files, file => {
    const action = file.match(/(\w+).js/)[1];
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const f = require(file);
    const info = f.desc || '';

    if (f.category) {
      categories[f.category].commands.push({
        text: `${'  $'.grey + pad(` ${config.cli} ${action}`)} ${info.grey}`,
        weight: f.weight,
      });
    }
  });

  _.each(categories, category => {
    console.log('');
    console.log(category.desc);
    _.each(_.sortBy(category.commands, 'weight'), command => {
      console.log(command.text);
    });
  });

  console.log('');

  process.exitCode = 0;
};
