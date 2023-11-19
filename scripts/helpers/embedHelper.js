const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } = require("discord.js");
const { AudioPlayerStatus } = require("@discordjs/voice");
const constants = require("../constants");

/**
 * Prepares and sends embed playlist to the channel
 *
 * @param {import("discord.js").BaseInteraction} interaction
 * @return {Promise<import("discord.js").Message<boolean>>}
 */
function sendInitialEmbedPlaylist(interaction) {
    let embedPlaylist = createInitialEmbedPlaylist();
    let buttonRows = createButtonRows();

    return interaction.channel.send({
        embeds: [embedPlaylist],
        components: [...buttonRows]
    })
}

/**
 * Send embed playlist that contains playlist names
 * @param {import("discord.js").BaseInteraction} interaction
 * @param {string} description
 * @return {Promise<import("discord.js").Message<boolean>>}
 */
function sendEmbedPlaylistNames(interaction, description) {
    let embedListOfPlaylists = new EmbedBuilder()
        .setTitle("List Of Playlists")
        .setDescription(description);

    return interaction.channel.send({
        embeds: [embedListOfPlaylists]
    });
}

/**
 * Creates default embed playlist
 * @return {EmbedBuilder}
 */
function createInitialEmbedPlaylist() {
    return new EmbedBuilder()
        .setTitle("Playlist")
        .setDescription("Initialized embed");
}

/**
 * Creates a button row for embed playlist
 *
 * @param {Object} [buttonOptions]
 * @param {boolean} [buttonOptions.atFirst] - determines if audio player plays first music
 * @param {boolean} [buttonOptions.atLast] - determines if audio player plays last music
 * @param {boolean} [buttonOptions.isPaused - determines if audio player is paused
 * @param {boolean} [buttonOptions.isMoreButtonClicked] - determines if "more" button is already clicked
 * @param {boolean} [buttonOptions.isVolumeMax] - determines if audio volume is at maximum
 * @param {boolean} [buttonOptions.isVolumeMin] - determines if audio player is at minimum
 * @param {boolean} [buttonOptions.isLastMusicPlayed] - determines if audio player is at minimum
 * @return {ActionRowBuilder[]}
 */
function createButtonRows(buttonOptions) {
    let buttonRows = [];
    let buttonRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(constants.buttonId.prev)
                .setLabel("⏮")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(Boolean(!buttonOptions || (buttonOptions && (buttonOptions.atFirst || buttonOptions.isPaused)))),
            new ButtonBuilder()
                .setCustomId(constants.buttonId.next)
                .setLabel("⏭")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(Boolean(!buttonOptions || (buttonOptions && (buttonOptions.atLast || buttonOptions.isPaused || buttonOptions.isLastMusicPlayed)))),
            new ButtonBuilder()
                .setCustomId(constants.buttonId.pause)
                .setLabel(buttonOptions && buttonOptions.isPaused ? "▶" : "⏸")
                .setStyle(buttonOptions && buttonOptions.isPaused ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setDisabled(Boolean(!buttonOptions || (buttonOptions && buttonOptions.isLastMusicPlayed))),
            new ButtonBuilder()
                .setCustomId(constants.buttonId.stop)
                .setLabel("⏹")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(Boolean(!buttonOptions)),
            new ButtonBuilder()
                .setCustomId(constants.buttonId.more)
                .setLabel("...")
                .setStyle(buttonOptions && buttonOptions.isMoreButtonClicked ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setDisabled(Boolean(!buttonOptions || (buttonOptions && buttonOptions.isLastMusicPlayed)))
        );

    buttonRows.push(buttonRow);

    if (buttonOptions && buttonOptions.isMoreButtonClicked) {
        buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(constants.buttonId.volumeUp)
                    .setLabel("🔊")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(Boolean(buttonOptions && buttonOptions.isVolumeMax)),
                new ButtonBuilder()
                    .setCustomId(constants.buttonId.volumeDown)
                    .setLabel("🔈")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(Boolean(buttonOptions && buttonOptions.isVolumeMin)),
                new ButtonBuilder()
                    .setCustomId(constants.buttonId.shuffle)
                    .setLabel("🔀")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(false)
            );
        buttonRows.push(buttonRow);
    }

    return buttonRows;
}

/**
 * Recreates embed playlist and updates it in the channel
 *
 * @param {import("discord.js").Message} embedPlaylistMessage - embed message that is present in the channel
 * @param {boolean} error - determines if any error occurred in the embed
 * @param {Object} embedPlaylistOptions
 * @param {string} [embedPlaylistOptions.updateDescription] - updates description of the embed playlist
 * @param {Object[]} [embedPlaylistOptions.updateField] - updates fields of the embed playlist
 * @param {string} [embedPlaylistOptions.updateField.name] - specifies which field that should be updated
 * @param {string} [embedPlaylistOptions.updateField.value] - specifies which value that should be used in the field
 * @param {string} [embedPlaylistOptions.updateTitle] - updates title section of the embed playlist
 * @param {Object} [buttonOptions]
 * @param {atFirst} buttonOptions.atFirst - determines if audio player plays first music
 * @param {atLast} buttonOptions.atLast - determines if audio player plays last music
 * @param {isPaused} buttonOptions.isPaused - determines if audio player is paused
 * @param {isMoreButtonClicked} buttonOptions.isMoreButtonClicked - determines if button id of more is in clicked state
 * @return {Promise<import("discord.js").Message>}
 */
function updateEmbedPlaylistByOptions(embedPlaylistMessage, error, embedPlaylistOptions, buttonOptions) {
    let embedStructure = {
        embeds: [],
        components: []
    }

    let embedPlaylist = createEmbedPlaylistBasedOnMessage(embedPlaylistMessage);

    if (embedPlaylistOptions && embedPlaylist) {
        Object.keys(embedPlaylistOptions).forEach(function (option) {
            let optionVal = embedPlaylistOptions[option];

            switch(option) {
                case "updateDescription":
                    embedPlaylist.setDescription(optionVal);
                    break;
                case "updateField":
                    let validFields = [];

                    for (const fieldObj of optionVal) {
                        if (Object.prototype.hasOwnProperty.call(fieldObj, "name") && Object.prototype.hasOwnProperty.call(fieldObj, "value")) {
                            validFields.push({
                                name: fieldObj.name,
                                value: fieldObj.value.toString()
                            })
                        }
                    }

                    embedPlaylist.setFields(validFields);
                    break;
                case "updateTitle":
                    embedPlaylist.setTitle(optionVal);
                    break;
            }
        });

    }
    
    if (embedPlaylist) {
        embedStructure.embeds.push(embedPlaylist);
    }

    if (!error) {
        let buttonRows = createButtonRows(buttonOptions);
        
        buttonRows.forEach((buttonRow) => {
            embedStructure.components.push(buttonRow);
        })
    }

    return embedPlaylistMessage.edit(embedStructure);

}

/**
 * Creates embed playlist according to the structure of embed message
 * @param {import("discord.js").Message} embedPlaylistMessage
 * @return {EmbedBuilder | null}
 */
function createEmbedPlaylistBasedOnMessage(embedPlaylistMessage) {
    let embedPlaylistOnMessage = getEmbedPlaylistFromMessage(embedPlaylistMessage);

    if (embedPlaylistMessage) {
        let embedPlaylist = new EmbedBuilder();

        embedPlaylist.setColor(Colors.Aqua);

        if (embedPlaylistOnMessage.title) {
            embedPlaylist.setTitle(embedPlaylistOnMessage.title);
        }

        if (embedPlaylistOnMessage.description) {
            embedPlaylist.setDescription(embedPlaylistOnMessage.description);
        }

        if (embedPlaylistOnMessage.fields && embedPlaylistOnMessage.fields.length > 0) {
            for (const field of embedPlaylistOnMessage.fields) {
                embedPlaylist.addFields({
                    name: field.name,
                    value: field.value.toString()
                })
            }
        }

        return embedPlaylist;
    }

    return null;
}

/**
 * Fetches embed playlist from embed message
 * @param {import("discord.js").Message} embedPlaylistMessage
 * @return {import("discord.js").Embed | null}
 */
function getEmbedPlaylistFromMessage(embedPlaylistMessage) {
    if (embedPlaylistMessage && embedPlaylistMessage.embeds && embedPlaylistMessage.embeds.length > 0) {
        return embedPlaylistMessage.embeds[0];
    }

    return null;
}


/**
 * Constructs an object that contains options for rendering buttons
 * @param {import("../scripts/models/playlist")} playlist - Playlist object
 * @param {AudioPlayerStatus} audioPlayerState - status of the audio player
 * @return {{atFirst: boolean, atLast: boolean, isPaused: boolean, isMoreButtonClicked: boolean, isLastMusicPlayed: boolean}}
 */
function prepareButtonOptions(playlist, audioPlayerState) {
    return {
        atFirst: playlist.atFirst(),
        atLast: playlist.atLast(),
        isPaused: audioPlayerState === AudioPlayerStatus.Paused,
        isMoreButtonClicked: playlist.getMoreButtonClicked(),
        isVolumeMax: playlist.getVolume() === constants.volume.max,
        isVolumeMin: playlist.getVolume() === constants.volume.min,
        isLastMusicPlayed: false
    };
}

module.exports = {
    sendInitialEmbedPlaylist: sendInitialEmbedPlaylist,
    updateEmbedPlaylistByOptions: updateEmbedPlaylistByOptions,
    sendEmbedPlaylistNames: sendEmbedPlaylistNames,
    prepareButtonOptions: prepareButtonOptions
}
