const config = require('config');
// const open = require('opn');

exports.desc = 'Generate your all pages in PDF format';
exports.category = 'utilities';
exports.weight = 3;

const configStore = require('../lib/configstore');

exports.run = function({ opts }) {

  const project = configStore.get('project');

  if (!project) {
    return Promise.reject(new Error(`Please login using ${config.cli} login`));
  }

  console.log('PDF generation');
  return null;
};
