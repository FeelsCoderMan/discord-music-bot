const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } = require("discord.js");
const constants = require("./constants");

function sendInitialEmbedPlaylist(interaction) {
    let embedPlaylist = createInitialEmbedPlaylist();
    let buttonRow = createButtonRow();

    return interaction.channel.send({
        embeds: [embedPlaylist],
        components: [buttonRow]
    })
}

function sendEmbedPlaylistNames(interaction, description) {
    let embedListOfPlaylists = new EmbedBuilder()
        .setTitle("List Of Playlists")
        .setDescription(description);

    return interaction.channel.send({
        embeds: [embedListOfPlaylists]
    });
}

function createInitialEmbedPlaylist() {
    return new EmbedBuilder()
        .setTitle("Playlist")
        .setDescription("Initialized embed");
}

function createButtonRow(buttonOptions) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId(constants.buttonId.prev)
            .setLabel("⏮")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(buttonOptions && (buttonOptions.atFirst || buttonOptions.isPaused)),
            new ButtonBuilder()
            .setCustomId(constants.buttonId.next)
            .setLabel("⏭")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(buttonOptions && (buttonOptions.atLast || buttonOptions.isPaused)),
            new ButtonBuilder()
            .setCustomId(constants.buttonId.pause)
            .setLabel(buttonOptions && buttonOptions.isPaused ? "▶" : "⏸")
            .setStyle(buttonOptions && buttonOptions.isPaused ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder()
            .setCustomId(constants.buttonId.stop)
            .setLabel("⏹")
            .setStyle(ButtonStyle.Danger)
        );
}

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
            }
        });

    }
    
    if (embedPlaylist) {
        embedStructure.embeds.push(embedPlaylist);
    }

    if (!error) {
        embedStructure.components.push(createButtonRow(buttonOptions));
    }

    return embedPlaylistMessage.edit(embedStructure);

}

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

function getEmbedPlaylistFromMessage(embedPlaylistMessage) {
    if (embedPlaylistMessage && embedPlaylistMessage.embeds && embedPlaylistMessage.embeds.length > 0) {
        return embedPlaylistMessage.embeds[0];
    }

    return null;
}

module.exports = {
    sendInitialEmbedPlaylist: sendInitialEmbedPlaylist,
    updateEmbedPlaylistByOptions: updateEmbedPlaylistByOptions,
    sendEmbedPlaylistNames: sendEmbedPlaylistNames
}
