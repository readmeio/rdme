const path = require('path');
const fs = require('fs');
const config = require('config');
const usage = require('command-line-usage')

exports.run = function() {
  const usageSections = [
    {
      content: `rdme

  CLI wrapper around ReadMe's HTTP API.

  Usage: ${config.cli} <command> [arguments]`,
      raw: true
    },
  ];

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
    auth: {
      desc: 'Authenticate',
      commands: [],
    },
    apis: {
      desc: 'Sync Swagger/OpenAPI files',
      commands: [],
    },
    docs: {
      desc: 'Documentation',
      commands: [],
    },
    versions: {
      desc: 'Versions',
      commands: []
    },
    utilities: {
      desc: 'Other useful commands',
      commands: [],
    },
  };

  files.forEach(file => {
    const action = path.basename(file, '.js');
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const f = require(file);
    const info = f.desc || '';

    // Some commands dont have docs e.g. help
    if (!f.category) return;

    categories[f.category].commands.push({
      name: f.action || action,
      desc: info,
      weight: f.weight,
    });
  });

  Object.keys(categories).forEach(key => {
    const category = categories[key];
    const commandCategory = {
      header: category.desc,
      content: []
    }

    category.commands
      .sort((a, b) => a.weight > b.weight)
      .forEach(command => {
        commandCategory.content.push({
          name: `${'$'.grey} ${config.cli} ${command.name}`,
          summary: command.desc.grey
        })
      });

    usageSections.push(commandCategory)
  });

  console.log(usage(usageSections));

  process.exitCode = 0;

  return Promise.resolve();
};
