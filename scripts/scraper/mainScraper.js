const browserObject = require("./browser");
const scraperController = require("./playlistController");

/**
 * Main function of the web scraper
 * @param {string} url 
 * @return {string[]} array of music urls
 */
module.exports = function (url) {
    const browserInstance = browserObject.startBrowser();
    return scraperController(browserInstance, url);
}
