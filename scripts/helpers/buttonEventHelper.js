const { getVoiceConnection, AudioPlayerStatus } = require("@discordjs/voice");
const constants = require("../constants");
const embedHelper = require("./embedHelper");
const logger = require("../logger");

/**
 * Emits a button event from AudioPlayer
 * @param {import("discord.js").ButtonInteraction} interaction - button interaction that is triggered
 * by interaction create event
 * @return {void}
 */
async function handleButtonEvent(interaction) {
    const buttonId = interaction.customId;

    if (!buttonId) {
        logger.error("Button id does not exist.");
        return;
    }

    logger.info("Button " + buttonId + " is triggered.")
    
    const connection = getVoiceConnection(interaction.guildId);

    if (connection) {
        const subscription = connection.state.subscription;
        
        if (subscription) {
            const currentAudioPlayer = subscription.player;

            if (currentAudioPlayer) {
                await interaction.deferUpdate();
                currentAudioPlayer.emit(buttonId);
            }
        }
    }
}

/**
 * Attaches button event listeners to the audio player
 * @param {import("@discordjs/voice").AudioPlayer} audioPlayer 
 * @param {import("./models/playlist")} playlist - playlist model
 * @param {import("discord.js").Message} embedPlaylistMessage - embed playlist 
 * @param {import("@discordjs/voice").VoiceConnection} connection 
 */
function loadButtonEventListeners(audioPlayer, playlist, embedPlaylistMessage, connection) {
    loadPrevButtonEvent(audioPlayer);
    loadNextButtonEvent(audioPlayer);
    loadPauseButtonEvent(audioPlayer, playlist, embedPlaylistMessage);
    loadStopButtonEvent(audioPlayer, embedPlaylistMessage, connection);
    loadMoreButtonEvent(audioPlayer, playlist, embedPlaylistMessage);
    loadVolumeUpButtonEvent(audioPlayer, playlist, embedPlaylistMessage);
    loadVolumeDownButtonEvent(audioPlayer, playlist, embedPlaylistMessage);
    loadShuffleButtonEvent(audioPlayer, playlist, embedPlaylistMessage);
}

function loadShuffleButtonEvent(audioPlayer, playlist, embedPlaylistMessage) {
    audioPlayer.on(constants.buttonId.shuffle, async () => {
        playlist.shuffle();
        await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, false, {
            updateDescription: "Playlist is shuffled."
        }, embedHelper.prepareButtonOptions(playlist, audioPlayer.state.status));
        audioPlayer.emit(AudioPlayerStatus.Idle, null, null, constants.enumAudioSelection.curr);
    });
}

/**
 * Attaches volume up button event listener to the audioPlayer
 * @param {import("@discordjs/voice").AudioPlayer} audioPlayer 
 * @param {import("./models/playlist")} playlist - playlist model
 * @param {import("discord.js").Message} embedPlaylistMessage - embed playlist 
 */
function loadVolumeUpButtonEvent(audioPlayer, playlist, embedPlaylistMessage) {
    audioPlayer.on(constants.buttonId.volumeUp, async () => {
        playlist.setVolume(playlist.getVolume() + 0.1);
        await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, false, {
            updateDescription: "Volume will be increased after current music is changed."
        }, embedHelper.prepareButtonOptions(playlist, audioPlayer.state.status));
    });
}

/**
 * Attaches volume down button event listener to the audioPlayer
 * @param {import("@discordjs/voice").AudioPlayer} audioPlayer 
 * @param {import("./models/playlist")} playlist - playlist model
 * @param {import("discord.js").Message} embedPlaylistMessage - embed playlist 
 */
function loadVolumeDownButtonEvent(audioPlayer, playlist, embedPlaylistMessage) {
    audioPlayer.on(constants.buttonId.volumeDown, async () => {
        playlist.setVolume(playlist.getVolume() - 0.1);
        await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, false, {
            updateDescription: "Volume will be decreased after current music is changed."
        }, embedHelper.prepareButtonOptions(playlist, audioPlayer.state.status));
    });
}

/**
 * Attaches show moree button event listener to the audioPlayer
 * @param {import("@discordjs/voice").AudioPlayer} audioPlayer 
 * @param {import("./models/playlist")} playlist - playlist model
 * @param {import("discord.js").Message} embedPlaylistMessage - embed playlist 
 */
function loadMoreButtonEvent(audioPlayer, playlist, embedPlaylistMessage) {
    audioPlayer.on(constants.buttonId.more, async () => {
        let isMoreButtonClicked = playlist.getMoreButtonClicked();
        playlist.setMoreButtonClicked(!isMoreButtonClicked);

        await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, false, null, 
            embedHelper.prepareButtonOptions(playlist, audioPlayer.state.status));
    });
}

/**
 * Attaches prev music button event listener to the audioPlayer
 * @param {import("@discordjs/voice").AudioPlayer} audioPlayer 
 */
function loadPrevButtonEvent(audioPlayer) {
    audioPlayer.on(constants.buttonId.prev, () => {
        audioPlayer.emit(AudioPlayerStatus.Idle, null, null, constants.enumAudioSelection.prev);
    });
}

/**
 * Attaches next music button event listener to the audioPlayer
 * @param {import("@discordjs/voice").AudioPlayer} audioPlayer 
 */
function loadNextButtonEvent(audioPlayer) {
    audioPlayer.on(constants.buttonId.next, () => {
        audioPlayer.emit(AudioPlayerStatus.Idle);
    });
}

/**
 * Attaches pause button event listener to the audioPlayer
 * @param {import("@discordjs/voice").AudioPlayer} audioPlayer 
 * @param {import("./models/playlist")} playlist - playlist model
 * @param {import("discord.js").Message} embedPlaylistMessage - embed playlist 
 */
function loadPauseButtonEvent(audioPlayer, playlist, embedPlaylistMessage) {
    audioPlayer.on(constants.buttonId.pause, async () => {
        let statusMsg;

        if (audioPlayer.state.status === AudioPlayerStatus.Paused) {
            let isUnpaused = audioPlayer.unpause();

            if (isUnpaused) {
                statusMsg = "Audio player is unpaused.";
                logger.info(statusMsg);
            } else {
                statusMsg = "Audio player could not be unpaused.";
                logger.warn(statusMsg);
            }

            return await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, false, {
                updateDescription: statusMsg
            }, embedHelper.prepareButtonOptions(playlist, audioPlayer.state.status));
        }

        let isPaused = audioPlayer.pause();

        if (isPaused) {
            statusMsg = "Audio player is paused.";
            logger.info(statusMsg);
        } else {
            statusMsg = "Audio player could not be paused.";
            logger.warn(statusMsg);
        }

        await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, false, {
            updateDescription: statusMsg
        }, embedHelper.prepareButtonOptions(playlist, audioPlayer.state.status));

    });
}

/**
 * Attaches stop button event listener to the audioPlayer
 * @param {import("@discordjs/voice").AudioPlayer} audioPlayer 
 * @param {import("./models/playlist")} playlist - playlist model
 * @param {import("discord.js").Message} embedPlaylistMessage - embed playlist 
 */
function loadStopButtonEvent(audioPlayer, embedPlaylistMessage, connection) {
    audioPlayer.on(constants.buttonId.stop, () => {
        audioPlayer.stop();
        embedPlaylistMessage.delete();
        connection.destroy();
    });
}

module.exports = {
    handleButtonEvent: handleButtonEvent,
    loadButtonEventListeners: loadButtonEventListeners
}
