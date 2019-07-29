const config = require('config');
const puppeteer = require('puppeteer');
const args = process.argv.slice(3);

exports.desc = 'Generate your all pages into PDF format and save into file';
exports.category = 'utilities';
exports.weight = 3;
exports.action = 'pdf [filename]';

const configStore = require('../lib/configstore');

exports.run = async function() {
  const project = configStore.get('project');

  if (!project) {
    return Promise.reject(new Error(`Please login using ${config.cli} login`));
  }

  console.log('input pdf params: ', args);
  if (args[0]) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    console.log('PDF generation using puppeteer');
    await page.goto('https://github.com/GoogleChrome/puppeteer');
    await page.pdf({ path: args[0], format: 'A4' });
  
    await browser.close();
  }


  console.log('hey pdf generation');
  return Promise.resolve();
};
