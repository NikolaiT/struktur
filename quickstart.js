// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");

// add stealth plugin and use defaults (all evasion techniques)
const pluginStealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(pluginStealth());

const config = {
    urls: {
        'google': 'https://www.google.de/search?q=europe+news',
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

puppeteer.launch({ headless: false, args: config.chrome_flags }).then(async browser => {
    const page = await browser.newPage();
    await page.setBypassCSP(true);
    await page.setViewport({ width: 1920, height: 1040 });
    await page.goto(config.urls.google, {waitUntil: 'networkidle0'});

    await page.waitFor(1000);

    await page.addScriptTag({path: 'struktur.js'});

    var results = await page.evaluate(() => {
        return struktur({
            N: 7,
            highlightStruktur: true,
            highlightContent: true,
            addClass: false,
        });
    });

    await page.waitFor(1000);
    console.log(results);

    await browser.close();
});