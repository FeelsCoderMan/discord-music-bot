const { SlashCommandBuilder } = require("discord.js");
const embedHelper = require("../scripts/helpers/embedHelper");
const formatHelper = require("../scripts/helpers/formatHelper");
const pathHelper = require("../scripts/helpers/pathHelper");
const logger = require("../scripts/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('showplaylist')
        .setDescription('shows the musics that playlist has')
        .addStringOption(option => 
            option.setName("playlistname")
                .setDescription("Name of the playlist")
                .setRequired(true)
        ),
    async execute(interaction) {
        let errorMsg;
        const playlistName = interaction.options.getString("playlistname");
        let embedPlaylistMessage = await embedHelper.sendInitialEmbedPlaylist(interaction, false);

        if (!pathHelper.checkIfPlaylistExists(playlistName)) {
            errorMsg = "Could not find playlist " + playlistName;
            logger.error(errorMsg);
            return await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, true, {
                updateDescription: errorMsg
            });
        }

        let musicPaths = pathHelper.retrieveMusicPathsByPlaylist(playlistName);

        await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, false, {
            updateTitle: "List of musics of playlist " + playlistName,
            updateDescription: formatHelper.formatEmbedMusicNames(musicPaths)
        });
    }
}
