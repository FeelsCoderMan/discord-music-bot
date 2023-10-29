const logger = require("../logger");
const puppeteer = require("puppeteer");

/**
 * Opens the browser
 * @return {puppeteer.Browser} browser
 */
async function startBrowser() {
    let browser;

    try {
        logger.info("Opening the browser...");
        browser = await puppeteer.launch({
            headless: "new",
            args: ["--disable-setuid-sandbox"],
            ignoreHTTPSErrors: true
        })
    } catch (err) {
        logger.error("Could not create a browser instance => : " + err);
    }

    return browser;
}

module.exports = {
    startBrowser: startBrowser
};
