const ffmpeg = require("ffmpeg");
const ytdl = require("ytdl-core");

const constants = require("./constants");
const scraper = require("./scraper/mainScraper");
const logger = require("./logger");
const pathHelper = require("./helpers/pathHelper");

/**
 * Downloads the music from youtube url
 * @param {string} url - url of the music
 * @param {string} playlistName - name of playlist that music will be stored on
 * @param {number} musicIndex - position of the music according to the playlist
 * @return {{error: boolean, errorMessage: string, downloadedMusicTitle: string}} 
 */
async function downloadMusicFromUrl(url, playlistName, musicIndex) {
    let result = {
        error: false,
        errorMessage: "",
        downloadedMusicTitle: ""
    }

    const options = {
        filter: "audioonly",
        quality: "highestaudio"
    }

    try {
        let isValid = ytdl.validateURL(url);

        if (!isValid) {
            result.errorMessage = "Url of " + url + " was not valid";
            result.error = true;
            return result;
        }

        let info = await ytdl.getInfo(url, options);

        if (!info) {
            result.errorMessage = "Could not fetch video information from " + url;
            result.error = true;
            return result;
        }

        if (info.videoDetails && info.videoDetails.title && info.videoDetails.author) {
            const filePath = pathHelper.prepareMusicFilePath(playlistName, info.videoDetails.title, musicIndex);
            const videoFilePath = filePath + constants.fileExtensions.video;
            const audioFilePath = filePath + constants.fileExtensions.audio;

            if (pathHelper.checkIfFileExists(audioFilePath)) {
                logger.warn("Audio file " + audioFilePath + " already exists");
                return result;
            }

            let writeStream = null;

            if (!pathHelper.checkIfFileExists(videoFilePath)) {
                logger.info("Writing to " + videoFilePath);
                writeStream = pathHelper.createWriteStream(videoFilePath);
                ytdl.downloadFromInfo(info, options).pipe(writeStream);
            }

            if (writeStream) {
                // TODO: Handle an error where writing process is failed
                let isWritingSuccess = await new Promise((resolve, reject) => {
                    writeStream.on("finish", function() {
                        logger.info("Writing file is done");
                        resolve(true);
                    }).on("error", function () {
                        reject(false);
                    });
                })

                writeStream.close();

                if (!isWritingSuccess) {
                    result.errorMessage = "Writing stream to " + videoFilePath + " is failed";
                    result.error = true;
                    return result;
                }
            }

            const canBeConverted = await convertVideoToAudio(videoFilePath, audioFilePath);

            if (canBeConverted) {
                pathHelper.removeFile(videoFilePath);
                result.downloadedMusicTitle = formatMusicTitle(info.videoDetails.title);
                return result;
            }

            result.errorMessage = "Conversion failed on " + videoFilePath;
            result.error = true;
            return result;
        }
    } catch (err) {
        result.errorMessage = err;
        result.error = true;
        return result;
    }

    return result;
}

/**
 * Formats the music title from response of ytdl
 * @param {string} title
 * @return {string}
 */
function formatMusicTitle(title) {
    const regex = new RegExp(constants.regex.musicTitle, "g");
    return title.replace(regex, "");
}

/**
 * Converts video file to audio file via ffmpeg
 *
 * @param {string} videoFilePath - absolute path of the video file
 * @param {string} audioFilePath - absolute path of the audio file
 * @return {Promise<boolean>} true if conversion is successful
 */
async function convertVideoToAudio(videoFilePath, audioFilePath) {
    logger.info("Converting " + videoFilePath + " to " + audioFilePath);
    const process = new ffmpeg(videoFilePath);
    const video = await process;

    return new Promise((resolve, reject) => {
        video.fnExtractSoundToMP3(audioFilePath, function (error, file) {
            if (!error) {
                logger.info("Audio file " + file  + " is created");
                return resolve(true);
            }

            logger.info(error);
            return reject(false);
        });

    })
}

/**
 * Downloads youtube playlist from youtube playlist url
 * @param {string} playlistUrl - url of the youtube playlist
 * @param {string} playlistName - name of playlist that musics will be stored on
 * @param {import("discord.js").BaseInteraction} interaction
 * @return {{error: boolean, errorMessage: string, musicUrls: string[]}}
 */
async function downloadPlaylistFromUrl(playlistUrl, playlistName, interaction) {
    var result = {
        error: false,
        errorMessage: "",
        musicUrls: []
    }

    if (pathHelper.checkIfPlaylistExists(playlistName)) {
        result.error = true;
        result.errorMessage = "Playlist name " + playlistName + " already exists, please use different name."
        return result;
    }

    let isValid = validatePlaylist(playlistUrl);
    
    if (!isValid) {
        result.error = true;
        result.errorMessage = "Playlist url " + playlistUrl + " is not valid";
        return result;
    }

    let musicUrls = await scraper(playlistUrl);
    
    if (musicUrls.length > 0) {
        pathHelper.createPlaylistDir(playlistName);

        for (let i = 0; i < musicUrls.length; i++) {
            let musicUrl = musicUrls[i];
            let musicResult = await downloadMusicFromUrl(musicUrl, playlistName, i, interaction);

            if (musicResult.error) {
                result.error = true;
                result.errorMessage = musicResult.errorMessage;
                return result;
            }

            await interaction.editReply("Downloading (" + (i + 1) + "/" + musicUrls.length + ") : " + musicResult.downloadedMusicTitle)
        }

        result.musicUrls = musicUrls;
        return result;
    }

    result.error = true;
    result.errorMessage = "Could not find any music in the url of " + playlistUrl;
    return result;
}

/**
 * Checks if the url is a youtube playlist url
 * @param {string} playlistUrl - url of the playlist
 * @return {boolean}
 */
function validatePlaylist(playlistUrl) {
    let prefixOfYoutubePlaylist;
    
    if (!playlistUrl.includes("https://")) {
        return false;
    }

    if (playlistUrl.includes("https://www.")) {
        prefixOfYoutubePlaylist = constants.url.baseYoutubeUrl + constants.endPoints.playList;
    } else {
        prefixOfYoutubePlaylist = constants.url.baseYoutubeUrlExceptW3 + constants.endPoints.playList;
    }

    if (playlistUrl.includes("list=")) {
        const listId = playlistUrl.split("list=")

        if (listId) {
            return playlistUrl.startsWith(prefixOfYoutubePlaylist);
        }
    }

    return false;
}

module.exports = {
    downloadPlaylistFromUrl: downloadPlaylistFromUrl,
};

