// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");
const fs = require('fs');
// add stealth plugin and use defaults (all evasion techniques)
const pluginStealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(pluginStealth());

const config = {
    urls: {
        'ebay': 'https://www.ebay.de/sch/i.html?_from=R40&_trksid=p2380057.m570.l2632.R2.TR12.TRC2.A0.H0.Xsommer.TRS0&_nkw=sommerkleid&_sacat=15724',
        'google': 'https://www.google.de/search?q=europe+news',
        'bing': 'https://www.bing.com/search?q=news+usa',
        'duckduckgo': 'https://duckduckgo.com/?q=hotels+barcelona&t=h_&ia=web',
        // 'amazon': 'https://www.amazon.com/s?k=french+press',
        // 'google_news': 'https://news.google.com/?hl=de&gl=DE&ceid=DE:de',
        // 'news': 'https://www.spiegel.de/',
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
    for (var provider in config.urls) {
        let url = config.urls[provider];
        const page = await browser.newPage();
        await page.setBypassCSP(true);
        await page.setViewport({width: 1920, height: 1040});
        await page.goto(url, {waitUntil: 'networkidle0'});
        await page.waitFor(2000);
        await page.addScriptTag({path: 'struktur.js'});
        var results = await page.evaluate(() => {
            return struktur({
                N: 6,
                highlightStruktur: true,
                highlightContent: false,
                fulltext: true,
                addClass: false,
            });
        });
        await page.waitFor(2000);
        fs.writeFileSync(`examples/${provider}.json`, results);

        // Get the "viewport" of the page, as reported by the page.
        const dimensions = await page.evaluate(() => {
            return {
                width: document.body.scrollWidth,
                height: document.body.scrollHeight,
                deviceScaleFactor: window.devicePixelRatio,
            };
        });

        //await page.screenshot({ path: "struktur.png", clip: { x:0, y: 0, width: dimensions.width, height: dimensions.height / 3 }});
        await page.screenshot({path: `examples/${provider}.png`});
        await page.close()
    }
  await browser.close();
});