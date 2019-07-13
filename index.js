// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");
 
// add stealth plugin and use defaults (all evasion techniques)
const pluginStealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(pluginStealth());

const config = {
  'url': 'https://www.google.de/search?q=haus+tuerrahmen',
};

// puppeteer usage as normal
puppeteer.launch({ headless: false }).then(async browser => {
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600 });
  await page.goto(config.url, {waitUntil: 'networkidle2'});
  await page.addScriptTag({path: 'struktur.js'});

  var results = await page.evaluate(() => {
     return struktur({
         highlightStruktur: true,
         highlightContent: true,
     });
  });

  await page.waitFor(1000);

  console.log(results);

  await page.screenshot({ path: "struktur.png", fullPage: true });
  await browser.close();
});