const { createAudioResource } = require("@discordjs/voice");
const constants = require("../constants");

/**
 * Creates audio resource from playlist model
 * @param {import("./models/playlist")} playlist - playlist model
 * @param {string} enumAudioSelection - enumerator of audio selection defined in constants
 * @return {import("@discordjs/voice").AudioResource | null} audio resource which has metadata of the current music
 */
function createAudioResourceByMusicPath(playlist, enumAudioSelection) {
    const resourceObj = {
        metadata: {
            title: "",
            position: "",
            totalMusics: "",
            prevMusic: "",
            nextMusic: ""
        },
        inlineVolume: true
    }

    let musicPath;
    const EnumAudioSelection = constants.enumAudioSelection;

    switch (enumAudioSelection) {
        case EnumAudioSelection.curr:
            musicPath = playlist.curr();
            break;
        case EnumAudioSelection.prev:
            musicPath = playlist.prev();
            break;
        case EnumAudioSelection.next:
            musicPath = playlist.next();
            break;
        default:
            throw new Error("Unknown enum audio selection: " + enumAudioSelection);
    }

    if (!musicPath) {
        return null;
    }

    resourceObj.metadata.title = getMusicTitleFromMusicPath(musicPath) || "Could not get music title";
    resourceObj.metadata.position = playlist.getCurrentPosition();
    resourceObj.metadata.totalMusics = playlist.getTotalMusics();
    resourceObj.metadata.prevMusic = getMusicTitleFromMusicPath(playlist.showPrev()) || "Nothing prev in queue";
    resourceObj.metadata.nextMusic = getMusicTitleFromMusicPath(playlist.showNext()) || "Nothing next in queue";

    return createAudioResource(musicPath, resourceObj);
}

/**
 * Retrieves music title from music path
 * @param {string} musicPath - path of the audio file
 * @return {string|null} title of the music or null
 */
function getMusicTitleFromMusicPath(musicPath) {
    if (!musicPath) {
        return null;
    }

    const musicTitle = musicPath.match(/\/\d+\.(.*?)\.mp3/);

    if (musicTitle && musicTitle.length > 1) {
        return musicTitle[1]
            .split(constants.regex.musicDelimiter)
            .filter(el => el.length > 0)
            .join(" ");
    }

    return null;
}

module.exports = {
    createAudioResourceByMusicPath: createAudioResourceByMusicPath,
    getMusicTitleFromMusicPath: getMusicTitleFromMusicPath
}
