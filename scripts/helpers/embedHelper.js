const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } = require("discord.js");
const constants = require("../constants");
const EmbedPlaylistOptions = require("../models/embedPlaylistOptions");
const ButtonOptions = require("../models/buttonOptions");
const { storeUpdatedEmbedPlaylistMessageToGlobal } = require("./storeHelper");

/**
 * Prepares and sends embed playlist to the channel
 *
 * @param {import("discord.js").BaseInteraction} interaction
 * @param {boolean} [shouldButtonRender] - title of the embed
 * @param {string} [title] - title of the embed
 * @param {string} [description] - description of the embed
 * @return {Promise<import("discord.js").Message<boolean>>} promise of message that is sent
 */
async function sendInitialEmbedPlaylist(interaction, shouldButtonRender, title, description) {
    let embedObj = {
        embeds: [],
        components: []
    };

    let embedPlaylist = createInitialEmbedPlaylist(title, description);

    embedObj.embeds.push(embedPlaylist);
    
    if (shouldButtonRender) {
        let buttonRows = createButtonRows(new ButtonOptions());
        embedObj.components.push(...buttonRows);
    }
    
    let embedPlaylistMessage = await interaction.channel.send(embedObj);
    storeUpdatedEmbedPlaylistMessageToGlobal(embedPlaylistMessage, interaction.commandName);
    return new Promise(resolve => {
        resolve(embedPlaylistMessage);
    });
}

/**
 * Prepares and sends embed playlist content to the channel
 * @param {import("discord.js").BaseInteraction} interaction
 * @param {string} [title] - title of the embed
 * @param {string} [description] - description of the embed
 * @return {Promise<import("discord.js").Message<boolean>>}
 */
function sendInitialEmbedPlaylistContent(interaction, title, description) {
    let embedListOfPlaylists = createInitialEmbedPlaylist(title, description);

    return interaction.channel.send({
        embeds: [embedListOfPlaylists]
    });
}

/**
 * Creates default embed playlist
 * @param {string} [title] - title of the embed
 * @param {string} [description] - description of the embed
 * @return {EmbedBuilder}
 */
function createInitialEmbedPlaylist(title, description) {
    return new EmbedBuilder()
        .setTitle(title || "Playlist")
        .setDescription(description || "Initialized embed")
        .setColor(Colors.Aqua);
}

/**
 * Creates a button row for embed playlist
 *
 * @param {import("../models/buttonOptions")} buttonOptions model
 * @return {ActionRowBuilder[]} array of rows for embedplaylist
 */
function createButtonRows(buttonOptions) {
    let buttonRows = [];
    let buttonRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(constants.buttonId.prev)
                .setLabel("⏮")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(buttonOptions.disablePrev),
            new ButtonBuilder()
                .setCustomId(constants.buttonId.next)
                .setLabel("⏭")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(buttonOptions.disableNext),
            new ButtonBuilder()
                .setCustomId(constants.buttonId.pause)
                .setLabel(buttonOptions.disablePause ? "▶" : "⏸")
                .setStyle(buttonOptions.disablePause ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setDisabled(buttonOptions.disablePause),
            new ButtonBuilder()
                .setCustomId(constants.buttonId.stop)
                .setLabel("⏹")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(buttonOptions.disableStop),
            new ButtonBuilder()
                .setCustomId(constants.buttonId.more)
                .setLabel("...")
                .setStyle(buttonOptions && buttonOptions.isMoreButtonClicked ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setDisabled(buttonOptions.disableMore)
        );

    buttonRows.push(buttonRow);

    if (buttonOptions.isMoreButtonClicked) {
        buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(constants.buttonId.volumeUp)
                    .setLabel("🔊")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(buttonOptions.disableVolumeUp),
                new ButtonBuilder()
                    .setCustomId(constants.buttonId.volumeDown)
                    .setLabel("🔈")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(buttonOptions.disableVolumeDown),
                new ButtonBuilder()
                    .setCustomId(constants.buttonId.shuffle)
                    .setLabel("🔀")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(buttonOptions.disableShuffle)
            );
        buttonRows.push(buttonRow);
    }

    return buttonRows;
}

/**
 * Recreates embed playlist and updates it in the channel
 *
 * @param {boolean} error - determines if any error occurred in the embed
 * @param {EmbedPlaylistOptions} embedPlaylistOptions
 * @param {import("../models/buttonOptions")} buttonOptions
 * @return {Promise<import("discord.js").Message>} promise of message that is updated
 */
async function updateEmbedPlaylistByOptions(interaction, error, embedPlaylistOptions, buttonOptions) {
    let embedStructure = {
        embeds: [],
        components: []
    }

    let embedMessage = getEmbedMessageFromGlobal(interaction.commandName);
    let readOnlyEmbedPlaylist = getEmbedPlaylistFromMessage(embedMessage);
    let embedPlaylist = createEmbedPlaylistFromEmbed(readOnlyEmbedPlaylist);
    updateEmbedPlaylist(embedPlaylist, embedPlaylistOptions);

    if (embedPlaylist) {
        embedStructure.embeds.push(embedPlaylist);
    }

    if (!error && buttonOptions) {
        let buttonRows = createButtonRows(buttonOptions);
        
        buttonRows.forEach((buttonRow) => {
            embedStructure.components.push(buttonRow);
        })
    }

    embedMessage = await embedMessage.edit(embedStructure);
    storeUpdatedEmbedPlaylistMessageToGlobal(embedMessage, interaction.commandName);
    return new Promise(resolve => {
        resolve(embedMessage);
    });
}

/**
 * Updates embed playlist based on embedPlaylistOptions modal
 *
 * @param {EmbedBuilder} embedPlaylist
 * @param {EmbedPlaylistOptions} embedPlaylistOptions
 */
function updateEmbedPlaylist(embedPlaylist, embedPlaylistOptions) {
    if (embedPlaylistOptions && embedPlaylist) {
        if (embedPlaylistOptions.description) {
            embedPlaylist.setDescription(embedPlaylistOptions.description);
        }

        if (embedPlaylistOptions.title) {
            embedPlaylist.setTitle(embedPlaylistOptions.title);
        }

        if (embedPlaylistOptions.fields.length > 0) {
            embedPlaylist.setFields(...embedPlaylistOptions.fields);
        }
    }
}


/**
 * Creates embed playlist according to the structure of embed message
 * @param {import("discord.js").Message} embedPlaylistMessage
 * @return {EmbedBuilder | null}
 */
function createEmbedPlaylistFromEmbed(embed) {
    if (embed) {
        let embedPlaylist = new EmbedBuilder(embed);
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
 * Gets the embed message that is stored in global variable
 * @param {string} commandName
 * @return {import("discord.js").Message}
 */
function getEmbedMessageFromGlobal(commandName) {
    return global.message[commandName];
}

module.exports = {
    sendInitialEmbedPlaylist: sendInitialEmbedPlaylist,
    updateEmbedPlaylistByOptions: updateEmbedPlaylistByOptions,
    sendInitialEmbedPlaylistContent: sendInitialEmbedPlaylistContent,
    getEmbedMessageFromGlobal: getEmbedMessageFromGlobal
}
