const constants = require("../constants");
const logger = require("../logger");

/**
 * Scrapes the playlist url and fetches each music url from playlist
 * @param {import("puppeteer").Browser} browser
 * @param {string} playlistUrl - url of the youtube playlist
 * @return {string[]} array of music urls that the playlist has array of music urls that the playlist has
 */
async function scraper(browser, playlistUrl) {
    // TODO: move selector to constants
    let page = await browser.newPage();

    try {
        logger.info("Navigating to " + playlistUrl + "...");
        await page.goto(playlistUrl);
        await page.waitForSelector("ytd-section-list-renderer");

        logger.info("Started fetching music urls from " + playlistUrl);
        const urls = await (await page.$("body")).evaluate(function (body) {
            let urls = []

            if (body) {
                const playlistRenderer = body.querySelector("ytd-section-list-renderer");

                if (playlistRenderer) {
                    const thumbnails = playlistRenderer.querySelectorAll("ytd-thumbnail");
                    
                    if (thumbnails && thumbnails.length > 0) {
                        thumbnails.forEach((thumbnail) => {
                            const musicThumbnail = thumbnail.querySelector("#thumbnail");

                            if (musicThumbnail && musicThumbnail.href) {
                                urls.push(musicThumbnail.href);
                            }
                        });
                    }

                }
            }

            return urls;
        });

        logger.info("Fetching music urls is finished");
        closeBrowser(page, browser);

        return urls;
    } catch (err) {
        logger.error(err);
    }

    closeBrowser(page, browser);
    return [];
}

/**
 * Closes browser
 * @param {import("puppeteer").Page} page - youtube playlist page
 * @param {import("puppeteer").Browser} browser
 * @return {void}
 */
async function closeBrowser(page, browser) {
    await page.close();
    await browser.close();
}

module.exports = {
    scraper : scraper
}
