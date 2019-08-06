const config = require('config');
const puppeteer = require('puppeteer');
const pdfMerge = require('easy-pdf-merge');
const fs = require('fs');

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

  if (args[0]) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const referencePageUrl = `https://${project}.readme.io/reference`;
    const docPageUrl = `https://${project}.readme.io/docs`;

    await page.goto(referencePageUrl);
    await page.pdf({ path: 'reference.pdf', format: 'A4' });

    await page.goto(docPageUrl);
    await page.pdf({ path: 'docs.pdf', format: 'A4' });

    await browser.close();
  } else {
    console.log('Please input PDF file name');
  }
  return new Promise(async () => {
    pdfMerge(['./reference.pdf', './docs.pdf'], `./${args[0]}`, async err => {
      if (err) return console.log(err);
      await fs.unlink('./reference.pdf', err1 => {
        if (err1) throw err1;
      });
      await fs.unlink('./docs.pdf', async err2 => {
        if (err2) throw err2;
      });
      return console.log('success');
    });
  });
};
