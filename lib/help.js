const path = require('path');
const fs = require('fs');
const config = require('config');

exports.category = 'basic';
exports.desc = 'Learn what you can do with this tool';
exports.weight = 2;

function pad(text) {
  return text.padEnd(15);
}

exports.run = function() {
  console.log('');
  console.log(`Usage: ${config.cli} <command> [arguments]`);
  const files = fs
    .readdirSync(__dirname)
    .map(file => {
      const stats = fs.statSync(path.join(__dirname, file));
      if (stats.isDirectory()) {
        return fs.readdirSync(path.join(__dirname, file)).map(f => path.join(file, f));
      }
      return [file];
    })
    .reduce((a, b) => a.concat(b), [])
    .filter(file => file.endsWith('.js'))
    .map(file => path.join(__dirname, file));

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

  files.forEach(file => {
    const action = path.basename(file, '.js');
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const f = require(file);
    const info = f.desc || '';

    if (f.category) {
      categories[f.category].commands.push({
        text: `${'  $'.grey + pad(` ${config.cli} ${f.action || action}`)} ${info.grey}`,
        weight: f.weight,
      });
    }
  });

  Object.keys(categories).forEach(key => {
    const category = categories[key];
    console.log('');
    console.log(category.desc);
    category.commands.sort((a, b) => a.weight > b.weight).forEach(command => {
      console.log(command.text);
    });
  });

  console.log('');

  process.exitCode = 0;

  return Promise.resolve();
};
