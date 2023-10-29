const fs = require("fs");
const path = require("path");
const constants = require("./constants");

/**
 * Generates playlist path by playlist name
 * @param {string} playlistName - name of the playlist
 * @return {string} path of the playlist
 */
function retrievePlaylistPath(playlistName) {
    return path.join(__basedir, constants.directory.musicDir, playlistName);
}

/**
 * Generates music folder path
 * @return {string} path of the music folder
 */
function retrieveMusicFolderPath() {
    return path.join(__basedir, constants.directory.musicDir);
}

/**
 * Checks if the music folder is present
 * @return {boolean}
 */
function checkIfMusicFolderExists() {
    const musicFolderPath = retrieveMusicFolderPath();

    return checkIfFileExists(musicFolderPath);
}

/**
 * Checks if the playlist exists in the music folder
 * @param {string} playlistName - name of the playlist
 * @return {boolean}
 */
function checkIfPlaylistExists(playlistName) {
    let playlistPath = retrievePlaylistPath(playlistName);

    return checkIfFileExists(playlistPath);
}

/**
 * Checks if the file exists
 * @param {fs.PathLike} filePath - absolute path of the file
 * @return {boolean}
 */
function checkIfFileExists(filePath) {
    return fs.existsSync(filePath);
}

/**
 * Removes the file
 * @param {fs.PathLike} filePath - absolute path of the file
 */
function removeFile(filePath) {
    return fs.unlinkSync(filePath);
}

/**
 * Generates array of music file paths by name of the playlist
 * @param {string} playlistName - name of the playlist
 * @return {string[]} array of the ordered music file paths
 */
function retrieveMusicPathsByPlaylist(playlistName) {
    if (checkIfPlaylistExists(playlistName)) {
        return fs.readdirSync(retrievePlaylistPath(playlistName)).filter(function (file) {
            return file.includes(constants.fileExtensions.audio);
        }).sort(function (a, b) {
            // TODO: add dot to constants in order to follow consistency
            return a.split(".")[0] - b.split(".")[0];
        }).map(function (file) {
            return path.join(__basedir, constants.directory.musicDir, playlistName, file)
        });
    }

    return [];
}

/**
 * Creates a playlist directory in music folder
 *
 * @param {string} playlistName - name of the playlist that will be saved in 
 * music folder
 */
function createPlaylistDir(playlistName) {
    const isMusicFolderPresent = checkIfMusicFolderExists();
    
    if (!isMusicFolderPresent) {
        fs.mkdirSync(retrieveMusicFolderPath());
    }

    return fs.mkdirSync(retrievePlaylistPath(playlistName));
}

/**
 * Generates a music file path according to the parameters
 *
 * @param {string} playlistName - name of the playlist
 * @param {string} musicTitle - title of the music
 * @param {number} musicIndex - position of the music
 * @return {string} music file path
 */
function prepareMusicFilePath(playlistName, musicTitle, musicIndex) {
    const regex = new RegExp(constants.regex.musicTitle, "g");
    let title = musicTitle.replace(regex, "");
    title = title.replace(/\s/g, constants.regex.musicDelimiter);
    title = (musicIndex + 1) + "." + title;

    return path.join(__basedir, constants.directory.musicDir, playlistName, title);
}

/**
 * Get playlist names from music folder
 * @return {string[]}
 */
function getPlaylistNames() {
    const musicFolderPath = retrieveMusicFolderPath();
    
    if (checkIfFileExists(musicFolderPath)) {
        return fs.readdirSync(musicFolderPath);
    }
    
    return [];
}

/**
 * Get total number of musics that playlist has
 *
 * @param {string} playlistName
 * @return {number | null}
 */
function getTotalMusicsFromPlaylistName(playlistName) {
    const playlistPath = retrievePlaylistPath(playlistName);
    
    if (checkIfFileExists(playlistPath)) {
        return fs.readdirSync(playlistPath).length;
    }

    return null;
}


module.exports = {
    checkIfPlaylistExists: checkIfPlaylistExists,
    retrieveMusicPathsByPlaylist: retrieveMusicPathsByPlaylist,
    prepareMusicFilePath: prepareMusicFilePath,
    createPlaylistDir: createPlaylistDir,
    checkIfFileExists: checkIfFileExists,
    removeFile: removeFile,
    createWriteStream: fs.createWriteStream,
    getPlaylistNames: getPlaylistNames,
    getTotalMusicsFromPlaylistName: getTotalMusicsFromPlaylistName
}
