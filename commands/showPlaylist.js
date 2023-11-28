const { SlashCommandBuilder } = require("discord.js");
const embedHelper = require("../scripts/helpers/embedHelper");
const formatHelper = require("../scripts/helpers/formatHelper");
const pathHelper = require("../scripts/helpers/pathHelper");
const logger = require("../scripts/logger");
const EmbedPlaylistOptions = require("../scripts/models/embedPlaylistOptions");

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
        await embedHelper.sendInitialEmbedPlaylist(interaction, false);
        let embedPlaylistOptions = new EmbedPlaylistOptions();

        if (!pathHelper.checkIfPlaylistExists(playlistName)) {
            errorMsg = "Could not find playlist " + playlistName;
            logger.error(errorMsg);
            embedPlaylistOptions.setDescription(errorMsg);
            await embedHelper.updateEmbedPlaylistByOptions(interaction, true, embedPlaylistOptions);
            return;
        }

        let musicPaths = pathHelper.retrieveMusicPathsByPlaylist(playlistName);

        embedPlaylistOptions.setTitle("List of musics of playlist " + playlistName);
        embedPlaylistOptions.setDescription(formatHelper.formatEmbedMusicNames(musicPaths));

        await embedHelper.updateEmbedPlaylistByOptions(interaction, false, embedPlaylistOptions);
    }
}
