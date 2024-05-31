const { createAudioPlayer, joinVoiceChannel, AudioPlayerStatus, getVoiceConnection } = require("@discordjs/voice");
const { SlashCommandBuilder } = require("discord.js");

const logger = require("../scripts/logger");
const pathHelper = require("../scripts/helpers/pathHelper");
const embedHelper = require("../scripts/helpers/embedHelper");
const constants = require("../scripts/constants");
const Playlist = require("../scripts/models/playlist");
const musicHelper = require("../scripts/helpers/musicHelper");
const buttonEventHelper = require("../scripts/helpers/buttonEventHelper");
const EmbedPlaylistOptions = require("../scripts/models/embedPlaylistOptions");
const ButtonOptions = require("../scripts/models/buttonOptions");
const { createButtonOptions, createButtonOptionIfLastMusicPlayed } = require("../scripts/helpers/buttonOptionsHelper");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playplaylist')
        .setDescription('Plays the playlist provided by user')
        .addStringOption(option => 
            option.setName("playlistname")
                .setDescription("Name of the playlist that will be played")
                .setRequired(true)
        ),
    async execute(interaction) {
        let errorMsg;
        const playlistName = interaction.options.getString("playlistname");
        await embedHelper.sendInitialEmbedPlaylist(interaction, true);
        const connection = getVoiceConnection(interaction.guildId);
        let embedPlaylistOptions = new EmbedPlaylistOptions();

        if (connection) {
            errorMsg = "Discord bot is already running in voice channel";
            logger.error(errorMsg);
            embedPlaylistOptions.setDescription(errorMsg);
            await embedHelper.updateEmbedPlaylistByOptions(interaction, embedPlaylistOptions);
            return;
        }


        if (!pathHelper.checkIfPlaylistExists(playlistName)) {
            errorMsg = "Could not find playlist " + playlistName;
            logger.error(errorMsg);
            embedPlaylistOptions.setDescription(errorMsg);
            await embedHelper.updateEmbedPlaylistByOptions(interaction, embedPlaylistOptions);
            return;
        }

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            errorMsg = "Could not find voice channel";
            logger.error(errorMsg);
            embedPlaylistOptions.setDescription(errorMsg);
            await embedHelper.updateEmbedPlaylistByOptions(interaction, embedPlaylistOptions);
            return;
        }
        
        const musicPaths = pathHelper.retrieveMusicPathsByPlaylist(playlistName);

        if (musicPaths && musicPaths.length > 0) {
            embedPlaylistOptions.setDescription("Found playlist " + playlistName + " which has " + musicPaths.length + " musics.");
            embedPlaylistOptions.setTitle("Playlist " + playlistName);
            await embedHelper.updateEmbedPlaylistByOptions(interaction, embedPlaylistOptions);


            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            if (!connection) {
                errorMsg = "Could not establish connection between bot and voice channel.";
                logger.error(errorMsg);
                embedPlaylistOptions.setDescription(errorMsg);
                await embedHelper.updateEmbedPlaylistByOptions(interaction, embedPlaylistOptions);
                return;
            }

            initializeAudioPlayer(interaction, connection, musicPaths);
        }
    }
}


/**
 * Creates an audio player and connects it to the connection with button events
 * @param {import("discord.js").BaseInteraction} interaction
 * @param {import("@discordjs/voice").VoiceConnection} connection
 * @param {string[]} musicPaths
 * @return {void}
 */
function initializeAudioPlayer(interaction, connection, musicPaths) {
    const audioPlayer = createAudioPlayer();

    audioPlayer.on("error", error => {
        logger.error("Error: " + error.message + " with track " + error.resource.metadata.title);
    });
    
    connection.subscribe(audioPlayer);
    const playlist = new Playlist();
    playlist.setPlaylist(musicPaths);

    const EnumAudioSelection = constants.enumAudioSelection;

    let audio = musicHelper.createAudioResourceByMusicPath(playlist, EnumAudioSelection.curr);
    audio.volume.setVolume(playlist.getVolume());
    audioPlayer.play(audio);

    audioPlayer.on(AudioPlayerStatus.Idle, async (oldstate, newState, enumAudioSelection) => {
        audio = musicHelper.createAudioResourceByMusicPath(playlist, enumAudioSelection || EnumAudioSelection.next);

        if (!audio) {
            let embedPlaylistOptions = new EmbedPlaylistOptions();
            embedPlaylistOptions.setDescription("Audio player finished playing last music");
            return await embedHelper.updateEmbedPlaylistByOptions(interaction, embedPlaylistOptions, createButtonOptionIfLastMusicPlayed());
        }
        
        audio.volume.setVolume(playlist.getVolume());
        audioPlayer.play(audio);
    });

    audioPlayer.on(AudioPlayerStatus.Playing, async () => {
        let embedPlaylistOptions = new EmbedPlaylistOptions();
        embedPlaylistOptions.addField({ name: "Currently Playing", value: audio.metadata.title });
        embedPlaylistOptions.addField({ name: "Music Position", value: audio.metadata.position + "/" + audio.metadata.totalMusics });
        embedPlaylistOptions.addField({ name: "Prev Music", value: audio.metadata.prevMusic });
        embedPlaylistOptions.addField({ name: "Next Music", value: audio.metadata.nextMusic });
        embedPlaylistOptions.addField({ name: "Volume", value: (playlist.getVolume() * 100).toString() + "/100" });
        await embedHelper.updateEmbedPlaylistByOptions(interaction, embedPlaylistOptions, createButtonOptions(playlist, audioPlayer.state.status));
    });

    buttonEventHelper.loadButtonEventListeners(audioPlayer, playlist, interaction, connection);
}

