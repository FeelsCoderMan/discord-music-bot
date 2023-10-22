const logger = require("../logger");

async function scraper(browser, playlistUrl) {
    // TODO: move selector to constants
    const playlistSelector = "#wc-endpoint";
    let page = await browser.newPage();

    try {
        logger.info("Navigating to " + playlistUrl + "...");
        await page.goto(playlistUrl);
        await page.waitForSelector(playlistSelector);

        logger.info("Started fetching music urls from " + playlistUrl);
        const urls = await (await page.$("body")).evaluate(function (body, playlistSelector) {
            let urls = []

            if (body) {
                const musicNodes = body.querySelectorAll(playlistSelector);
                musicNodes.forEach(function (musicNode) {
                    urls.push(musicNode.href);
                })
            }

            return urls;
        }, playlistSelector);

        logger.info("Fetching music urls is finished");
        closeBrowser(page, browser);

        return urls;
    } catch (err) {
        logger.error(err);
    }

    closeBrowser(page, browser);
    return [];
}

async function closeBrowser(page, browser) {
    await page.close();
    await browser.close();
}

module.exports = {
    scraper : scraper
}
