const browserObject = require("./browser");
const scraperController = require("./playlistController");

module.exports = function (url) {
    const browserInstance = browserObject.startBrowser();
    return scraperController(browserInstance, url);
}
