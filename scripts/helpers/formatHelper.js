const musicHelper = require("./musicHelper");
const { getTotalMusicsFromPlaylistName } = require("./pathHelper");

/**
 * Formats name of the playlists for embed playlist
 * @param {string[]} playlistNames - array of name of playlists
 * @return {string} message that contains playlist name with total music information
 */
function formatEmbedPlaylistNames(playlistNames) {
    let message = "No playlist found.";

    if (playlistNames && playlistNames.length > 0) {
        message = playlistNames.map(function (playlistName, idx) {
            let totalMusics = getTotalMusicsFromPlaylistName(playlistName);
            return (idx + 1) + ". " + playlistName + " which has " + totalMusics + " musics.";
        }).join("\n");
    }

    return message;
}

/**
 * Formats name of the musics for embed playlist
 * @param {string[]} musicNames - array of name of musics that belong to the playlist
 * @return {string} message that contains playlist name with total music information
 */
function formatEmbedMusicNames(musicNames) {
    let message = "No musics found.";

    if (musicNames && musicNames.length > 0) {
        message = musicNames.map(function (musicName, idx) {
            return (idx + 1) + ". " + musicHelper.getMusicTitleFromMusicPath(musicName);
        }).join("\n");
    }

    return message;
}

module.exports = {
    formatEmbedPlaylistNames: formatEmbedPlaylistNames,
    formatEmbedMusicNames: formatEmbedMusicNames
}
