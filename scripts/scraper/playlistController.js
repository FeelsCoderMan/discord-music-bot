const logger = require("../logger");
const playlistScraper = require("./playlistScraper");

async function scrapeAll(browserInstance, url) {
    let browser;
    try {
        browser = await browserInstance;
        return playlistScraper.scraper(browser, url);
    } catch (err) {
        logger.error("Could not resolve the browser instance => " + err);
    }

    return new Promise([]);
}

module.exports = function (browserInstance, url) {
    return scrapeAll(browserInstance, url);
}

