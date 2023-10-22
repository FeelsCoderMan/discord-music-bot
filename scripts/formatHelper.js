const { getTotalMusicsFromPlaylistName } = require("./pathHelper");

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

module.exports = {
    formatEmbedPlaylistNames: formatEmbedPlaylistNames
}
