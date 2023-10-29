const { SlashCommandBuilder } = require("discord.js");
const { downloadPlaylistFromUrl } = require("../scripts/musicDownloader");
const logger = require("../scripts/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('downloadplaylist')
        .setDescription('Downloads a youtube playlist')
        .addStringOption(option => 
            option.setName("playlisturl")
                .setDescription("Url to download youtube playlist")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("playlistname")
                .setDescription("Name to store the musics from youtube playlist")
                .setRequired(true)
        ),
    async execute(interaction) {
        const playlistUrl  = interaction.options.getString("playlisturl");
        const playlistName = interaction.options.getString("playlistname");

        await interaction.editReply("Downloading playlist " + playlistName + " from url " + playlistUrl);
        const playlistObj = await downloadPlaylistFromUrl(playlistUrl, playlistName, interaction);

        if (playlistObj.error) {
            logger.error(playlistObj.errorMessage);
            await interaction.editReply(playlistObj.errorMessage);
            return;
        }

        await interaction.editReply("Finished downloading playlist " + playlistName);
    }
};
