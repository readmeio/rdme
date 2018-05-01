const fs = require('fs');
const cardinal = require('cardinal');
const os = require('os');
const path = require('path');
const glob = require('glob');
const figures = require('figures');

const _ = require('lodash');
const swagger = require('swagger-parser');
const swaggerInline = require('swagger-inline');

exports.config = function(env) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const config = require(`./config/${env || 'config'}`);

  // TODO: Make config a JS file; do this there.
  config.apiFile = path.join(os.homedir(), '.readme.json');

  return config;
};

exports.findSwagger = function(info, cb) {
  swaggerInline('**/*', {
    format: '.json',
    metadata: true,
    base: info.opts.in,
  }).then(generatedSwaggerString => {
    const generatedSwagger = JSON.parse(generatedSwaggerString);

    if (!generatedSwagger['x-si-base']) {
      console.log("We couldn't find a Swagger file.".red);
      console.log(
        `Don't worry, it's easy to get started! Run ${'oas init'.yellow} to get started.`,
      );
      process.exit();
    }

    const generatedSwaggerClone = JSON.parse(generatedSwaggerString); // Becasue swagger.validate modifies the original JSON
    swagger.validate(generatedSwaggerClone, err => {
      if (err) {
        // TODO: We should go through the crappy validation stuff
        // and try to make it easier to understand

        if (info.opts.v) {
          console.log(cardinal.highlight(JSON.stringify(generatedSwagger, undefined, 2)));
        }

        console.log('');
        console.log('Error validating Swagger!'.red);
        console.log('');
        if (!info.opts.v) {
          console.log(`Run with ${'-v'.grey} to see the invalid Swagger`);
          console.log('');
        }
        if (err.details) {
          _.each(err.details, detail => {
            const at = detail.path && detail.path.length ? ` (at ${detail.path.join('.')})` : '';
            console.log(`  ${figures.cross.red}  ${detail.message}${at.grey}`);
          });
        } else {
          console.log(`${figures.cross.red}  ${err.message}`);
        }
        console.log('');
        process.exit();
        return;
      }

      cb(undefined, generatedSwagger, generatedSwagger['x-si-base']);
    });
  });
};

exports.getAliasFile = function(unknownAction) {
  const files = glob.sync(path.join(__dirname, 'lib', '*'));
  let foundAction = false;
  _.each(files, file => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const actionInfo = require(file);
    if (actionInfo.aliases && actionInfo.aliases.indexOf(unknownAction) >= 0) {
      [foundAction] = file.match(/(\w+).js/);
    }
  });
  return foundAction;
};

exports.fileExists = function(file) {
  try {
    return fs.statSync(file).isFile();
  } catch (err) {
    return false;
  }
};

exports.guessLanguage = function() {
  // Really simple way at guessing the language.
  // If we're wrong, it's not a big deal... and
  // way better than asking them what language
  // they're writing (since the UI was confusing).

  let language = 'js';
  const languages = {
    rb: 0,
    coffee: 0,
    py: 0,
    js: 0,
    java: 0,
    php: 0,
    go: 0,
  };

  const files = glob.sync('*');
  _.each(files, f => {
    const ext = f.split('.').slice(-1)[0];
    if (typeof languages[ext] !== 'undefined') {
      languages[ext] += 1;
    }
  });

  _.each(languages, (i, l) => {
    if (i > languages[language]) {
      language = l;
    }
  });

  return language;
};

exports.swaggerInlineExample = function(lang) {
  const prefix = '    ';

  const annotation = [
    '@api [get] /pet/{petId}',
    'description: Returns all pets from the system that the user has access to',
    'parameters:',
    '  - (path) petId=2* {Integer} The pet ID',
    '  - (query) limit {Integer:int32} The number of resources to return',
  ];

  const languages = {
    js: ['/*', ' * ', ' */', 'route.get("/pet/:petId", pet.show);'],
    java: ['/*', ' * ', ' */', 'public String getPet(id) {'],
    php: ['/*', ' * ', ' */', 'function showPet($id) {'],
    coffee: ['###', '', '###', "route.get '/pet/:petId', pet.show"],
    rb: ['=begin', '', '=end', "get '/pet/:petId' do"],
    py: ['"""', '', '"""', 'def getPet(id):'],
    go: ['/*', ' * ', ' */', 'func getPet(id) {'],
  };

  let lowercaseLang = lang.toLowerCase();
  if (!lang || !languages[lang]) lowercaseLang = 'javascript';

  const language = languages[lowercaseLang];

  const out = [prefix + language[0].cyan];

  _.each(annotation, line => {
    out.push(prefix + language[1].cyan + line.cyan);
  });

  out.push(prefix + language[2].cyan);
  out.push(prefix + language[3].grey);

  return out.join('\n');
};
