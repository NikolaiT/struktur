// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");
 
// add stealth plugin and use defaults (all evasion techniques)
const pluginStealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(pluginStealth());

const config = {
    urls: {
        'sts1': 'https://scrapethissite.com/pages/simple/',
        'ebay': 'https://www.ebay.de/sch/i.html?_from=R40&_trksid=p2380057.m570.l2632.R2.TR12.TRC2.A0.H0.Xsommer.TRS0&_nkw=sommerkleid&_sacat=15724',
        'google': 'https://www.google.de/search?q=haus+tuerrahmen',
        'bing': 'https://www.bing.com/search?q=urlaub+madrid',
        'duckduckgo': 'https://duckduckgo.com/?q=hotels+barcelona&t=h_&ia=web',
        'reddit': 'https://www.reddit.com/',
        'huffpost': 'https://www.huffpost.com',
        'amazon': 'https://www.amazon.com/s?k=illuminati',
        'wp': 'https://www.washingtonpost.com/',
        'zeit': 'https://www.zeit.de/index',
    },
    chrome_flags: [
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--window-size=1920,1040',
        '--start-fullscreen',
        '--hide-scrollbars',
        '--disable-notifications',
    ],
};

// puppeteer usage as normal
puppeteer.launch({ headless: false, args: config.chrome_flags }).then(async browser => {

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1040 });
  await page.goto(config.urls.zeit, {waitUntil: 'networkidle2'});

  await page.waitFor(4000);

  await page.addScriptTag({path: 'struktur.js'});

  var results = await page.evaluate(() => {
     return struktur({
         N: 4,
         highlightStruktur: true,
         highlightContent: true,
         addClass: false,
     });
  });

  await page.waitFor(4000);

  console.log(results);

  await page.screenshot({ path: "struktur.png", fullPage: true });
  await browser.close();
});