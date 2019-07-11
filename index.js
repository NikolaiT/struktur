// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra")
 
// add stealth plugin and use defaults (all evasion techniques)
const pluginStealth = require("puppeteer-extra-plugin-stealth")
puppeteer.use(pluginStealth())
 
// puppeteer usage as normal
puppeteer.launch({ headless: true }).then(async browser => {
  const page = await browser.newPage()
  await page.setViewport({ width: 800, height: 600 })
  await page.goto("https://bot.sannysoft.com")
  await page.waitFor(5000)
  await page.screenshot({ path: "testresult.png", fullPage: true })
  await browser.close()
})