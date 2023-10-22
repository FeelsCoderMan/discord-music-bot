const embedHelper = require("../scripts/embedHelper");
const pathHelper = require("../scripts/pathHelper");
const formatHelper = require("../scripts/formatHelper");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listplaylists')
        .setDescription('Displays all of the playlists'),
    async execute(interaction) {
        let playlistNames = pathHelper.getPlaylistNames();
        let description = formatHelper.formatEmbedPlaylistNames(playlistNames);
        return await embedHelper.sendEmbedPlaylistNames(interaction, description);
    }
}
