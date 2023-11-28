const ButtonOptions = require("../models/buttonOptions");

/**
 * Constructs a buttonOptions modal according to playlist and audio state
 * @param {import("../models/playlist").Playlist} playlist
 * @param {import("@discordjs/voice").AudioPlayerState} audioPlayerState
 * @return {ButtonOptions}
 */
function createButtonOptions(playlist, audioPlayerState) {
    let buttonOptions = new ButtonOptions();

    if (playlist && audioPlayerState) {
        buttonOptions.updateButtonOptions(playlist, audioPlayerState);
    }

    return buttonOptions;
}

function createButtonOptionIfLastMusicPlayed() {
    let buttonOptions = new ButtonOptions();
    buttonOptions.updateButtonOptionsIfLastMusicPlayed();
    return buttonOptions;
}


module.exports = {
    createButtonOptions: createButtonOptions,
    createButtonOptionIfLastMusicPlayed: createButtonOptionIfLastMusicPlayed
}
