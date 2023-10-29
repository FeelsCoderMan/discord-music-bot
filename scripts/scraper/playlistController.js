const logger = require("../logger");
const playlistScraper = require("./playlistScraper");

/**
 * Initializes the browser in order to scrape the url
 * @param {import("puppeteer").Browser} browserInstance - browser object of puppeteer
 * @param {string} url
 * @return {string[]} array of music urls
 */
async function scrapeAll(browserInstance, url) {
    let browser;
    try {
        // Initialize the browser
        browser = await browserInstance;
        return playlistScraper.scraper(browser, url);
    } catch (err) {
        logger.error("Could not resolve the browser instance => " + err);
    }

    return [];
}

module.exports = function (browserInstance, url) {
    return scrapeAll(browserInstance, url);
}

