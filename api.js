var colors = require('colors');
var prompt = require('prompt-sync')();
var crypto = require('crypto');
var fs = require('fs');
var jsonfile = require('jsonfile');
var uslug = require('uslug');
var path = require('path');
var request = require('request');

var utils = require('./utils');

exports.api = function(args, opts) {
  opts = opts || {};

  var action = args[0];
  var config = utils.config(opts.env);

  var actionObj = exports.load(config, action);

  if(!actionObj) {
    return;
  }

  var info = {
    'args': args,
    'opts': opts,
  };

  actionObj.run(config, info);
};

exports.load = function(config, action) {
  if(!action) action = 'start';

  var file = path.join(__dirname, 'lib', `${action}.js`);
  if(utils.fileExists(file)) {
    return require(file);
  }

  var alias = utils.getAliasFile(action);
  if(alias) {
    var file = path.join(__dirname, 'lib', `${alias}.js`);
    return require(file);
  }

  console.log('Action not found.'.red);
  console.log('Type ' + `${config.cli} help`.yellow + ' to see all commands');
  process.exit();
};

function exampleId(file, apiId) {
  if(file.match(/json$/)) {
    console.log("");
    console.log("    {".grey);
    console.log("      \"swagger\": \"2.0\",".grey);
    console.log("      \"x-api-id\": \""+apiId+"\",");
    console.log("      \"info\": {".grey);
    console.log("      ...".grey);
  } else {
    console.log("");
    console.log("    swagger: \"2.0\"".grey);
    console.log("    x-api-id: \""+apiId+"\"");
    console.log("    info:".grey);
    console.log("      ...".grey);
  }
};

