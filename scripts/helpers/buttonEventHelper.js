const { getVoiceConnection, AudioPlayerStatus } = require("@discordjs/voice");
const constants = require("../constants");
const embedHelper = require("./embedHelper");
const logger = require("../logger");
const EmbedPlaylistOptions = require("../models/embedPlaylistOptions");
const { createButtonOptions } = require("./buttonOptionsHelper");

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
 * @param {import("discord.js").BaseInteraction} interaction
 * @param {import("@discordjs/voice").VoiceConnection} connection 
 */
function loadButtonEventListeners(audioPlayer, playlist, interaction, connection) {
    loadPrevButtonEvent(audioPlayer);
    loadNextButtonEvent(audioPlayer);
    loadPauseButtonEvent(audioPlayer, playlist, interaction);
    loadStopButtonEvent(audioPlayer, connection);
    loadMoreButtonEvent(audioPlayer, playlist, interaction);
    loadVolumeUpButtonEvent(audioPlayer, playlist, interaction);
    loadVolumeDownButtonEvent(audioPlayer, playlist, interaction);
    loadShuffleButtonEvent(audioPlayer, playlist, interaction);
}

/**
 * Attaches shuffle button event listener to the audioPlayer
 * @param {import("@discordjs/voice").AudioPlayer} audioPlayer 
 * @param {import("./models/playlist")} playlist - playlist model
 * @param {import("discord.js").BaseInteraction} interaction
 */
function loadShuffleButtonEvent(audioPlayer, playlist, interaction) {
    audioPlayer.on(constants.buttonId.shuffle, async () => {
        playlist.shuffle();
        let embedPlaylistOption = new EmbedPlaylistOptions();
        embedPlaylistOption.setDescription("Playlist is shuffled.")
        await embedHelper.updateEmbedPlaylistByOptions(interaction, 
            false, embedPlaylistOption,
            createButtonOptions(playlist, audioPlayer.state.status));
        audioPlayer.emit(AudioPlayerStatus.Idle, null, null, constants.enumAudioSelection.curr);
    });
}

/**
* Attaches volume up button event listener to the audioPlayer
* @param {import("@discordjs/voice").AudioPlayer} audioPlayer 
* @param {import("./models/playlist")} playlist - playlist model
* @param {import("discord.js").BaseInteraction} interaction 
*/
function loadVolumeUpButtonEvent(audioPlayer, playlist, interaction) {
    audioPlayer.on(constants.buttonId.volumeUp, async () => {
        playlist.setVolume(playlist.getVolume() + 0.1);
        let embedPlaylistOption = new EmbedPlaylistOptions();
        embedPlaylistOption.setDescription("Volume will be increased after current music is changed.")
        await embedHelper.updateEmbedPlaylistByOptions(interaction, 
            false, embedPlaylistOption, 
            createButtonOptions(playlist, audioPlayer.state.status));
    });
}

/**
 * Attaches volume down button event listener to the audioPlayer
 * @param {import("@discordjs/voice").AudioPlayer} audioPlayer 
 * @param {import("./models/playlist")} playlist - playlist model
 * @param {import("discord.js").BaseInteraction} interaction
 */
function loadVolumeDownButtonEvent(audioPlayer, playlist, interaction) {
    audioPlayer.on(constants.buttonId.volumeDown, async () => {
        playlist.setVolume(playlist.getVolume() - 0.1);
        let embedPlaylistOption = new EmbedPlaylistOptions();
        embedPlaylistOption.setDescription("Volume will be decreased after current music is changed.")
        await embedHelper.updateEmbedPlaylistByOptions(interaction, 
            false, embedPlaylistOption, 
            createButtonOptions(playlist, audioPlayer.state.status));
    });
}

/**
 * Attaches show more button event listener to the audioPlayer
 * @param {import("@discordjs/voice").AudioPlayer} audioPlayer 
 * @param {import("./models/playlist")} playlist - playlist model
 * @param {import("discord.js").BaseInteraction} interaction
 */
function loadMoreButtonEvent(audioPlayer, playlist, interaction) {
    audioPlayer.on(constants.buttonId.more, async () => {
        let embedPlaylistOption = new EmbedPlaylistOptions();
        let isMoreButtonClicked = playlist.getMoreButtonClicked();
        playlist.setMoreButtonClicked(!isMoreButtonClicked);
        await embedHelper.updateEmbedPlaylistByOptions(interaction, 
            false, embedPlaylistOption, 
            createButtonOptions(playlist, audioPlayer.state.status));
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
 * @param {import("discord.js").BaseInteraction} interaction
 */
function loadPauseButtonEvent(audioPlayer, playlist, interaction) {
    audioPlayer.on(constants.buttonId.pause, async () => {
        let statusMsg;
        let embedPlaylistOptions = new EmbedPlaylistOptions();

        if (audioPlayer.state.status === AudioPlayerStatus.Paused) {
            let isUnpaused = audioPlayer.unpause();

            if (isUnpaused) {
                statusMsg = "Audio player is unpaused.";
                logger.info(statusMsg);
            } else {
                statusMsg = "Audio player could not be unpaused.";
                logger.warn(statusMsg);
            }

            embedPlaylistOptions.setDescription(statusMsg);

            return await embedHelper.updateEmbedPlaylistByOptions(interaction, 
                false, embedPlaylistOptions,
                createButtonOptions(playlist, audioPlayer.state.status));
        }

        let isPaused = audioPlayer.pause();

        if (isPaused) {
            statusMsg = "Audio player is paused.";
            logger.info(statusMsg);
        } else {
            statusMsg = "Audio player could not be paused.";
            logger.warn(statusMsg);
        }

        embedPlaylistOptions.setDescription(statusMsg);
        await embedHelper.updateEmbedPlaylistByOptions(interaction, 
            false, embedPlaylistOptions,
            createButtonOptions(playlist, audioPlayer.state.status));

    });
}

/**
 * Attaches stop button event listener to the audioPlayer
 * @param {import("@discordjs/voice").AudioPlayer} audioPlayer 
 * @param {import("./models/playlist")} playlist - playlist model
 * @param {import("discord.js").BaseInteraction} interaction
 */
function loadStopButtonEvent(audioPlayer, connection) {
    audioPlayer.on(constants.buttonId.stop, () => {
        let embedPlaylistMessage = embedHelper.getEmbedMessageFromGlobal("playplaylist");
        audioPlayer.stop();
        embedPlaylistMessage.delete();
        connection.destroy();
    });
}

module.exports = {
    handleButtonEvent: handleButtonEvent,
    loadButtonEventListeners: loadButtonEventListeners
}
