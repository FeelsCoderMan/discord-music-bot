const embedHelper = require("../scripts/helpers/embedHelper");
const pathHelper = require("../scripts/helpers/pathHelper");
const formatHelper = require("../scripts/helpers/formatHelper");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listplaylists')
        .setDescription('Displays all of the playlists'),
    async execute(interaction) {
        let playlistNames = pathHelper.getPlaylistNames();
        let description = formatHelper.formatEmbedPlaylistNames(playlistNames);
        await embedHelper.sendEmbedPlaylistNames(interaction, description);
    }
}
