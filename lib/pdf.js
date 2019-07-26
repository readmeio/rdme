const config = require('config');
const puppeteer = require('puppeteer');
// const open = require('opn');

exports.desc = 'Generate your all pages in PDF format';
exports.category = 'utilities';
exports.weight = 3;

const configStore = require('../lib/configstore');

exports.run = function() {
  const project = configStore.get('project');

  if (!project) {
    return Promise.reject(new Error(`Please login using ${config.cli} login`));
  }

  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    console.log('PDF generation using puppeteer');
    await page.goto('https://github.com/GoogleChrome/puppeteer');
    await page.pdf({ path: 'hn.pdf', format: 'A4' });

    await browser.close();
  })();

  console.log('hey pdf generation');
  return Promise.resolve();
};
