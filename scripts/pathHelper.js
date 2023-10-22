const fs = require("fs");
const path = require("path");
const constants = require("./constants");

function retrievePlaylistPath(playlistName) {
    return path.join(__basedir, constants.directory.musicDir, playlistName);
}

function retrieveMusicFolderPath() {
    return path.join(__basedir, constants.directory.musicDir);
}

function checkIfMusicFolderExists() {
    const musicFolderPath = retrieveMusicFolderPath();

    return checkIfFileExists(musicFolderPath);
}

function checkIfPlaylistExists(playlistName) {
    let playlistPath = retrievePlaylistPath(playlistName);

    return checkIfFileExists(playlistPath);
}

function checkIfFileExists(filePath) {
    return fs.existsSync(filePath);
}

function removeFile(videoFilePath) {
    return fs.unlinkSync(videoFilePath);
}

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

    return null;
}

function createPlaylistDir(playlistName) {
    const isMusicFolderPresent = checkIfMusicFolderExists();
    
    if (!isMusicFolderPresent) {
        fs.mkdirSync(retrieveMusicFolderPath());
    }

    return fs.mkdirSync(retrievePlaylistPath(playlistName));
}

function prepareMusicFilePath(playlistName, musicTitle, musicIndex) {
    const regex = new RegExp(constants.regex.musicTitle, "g");
    let title = musicTitle.replace(regex, "");
    title = title.replace(/\s/g, constants.regex.musicDelimiter);
    title = (musicIndex + 1) + "." + title;

    return path.join(__basedir, constants.directory.musicDir, playlistName, title);
}

function getPlaylistNames() {
    const musicFolderPath = retrieveMusicFolderPath();
    
    if (checkIfFileExists(musicFolderPath)) {
        return fs.readdirSync(musicFolderPath);
    }
    
    return [];
}

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
