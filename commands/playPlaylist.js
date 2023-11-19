const { createAudioPlayer, joinVoiceChannel, AudioPlayerStatus, getVoiceConnection } = require("@discordjs/voice");
const { SlashCommandBuilder } = require("discord.js");

const logger = require("../scripts/logger");
const pathHelper = require("../scripts/helpers/pathHelper");
const embedHelper = require("../scripts/helpers/embedHelper");
const constants = require("../scripts/constants");
const Playlist = require("../scripts/models/playlist");
const musicHelper = require("../scripts/helpers/musicHelper");
const buttonEventHelper = require("../scripts/helpers/buttonEventHelper");

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
        let embedPlaylistMessage = await embedHelper.sendInitialEmbedPlaylist(interaction);
        const connection = getVoiceConnection(interaction.guildId);

        if (connection) {
            errorMsg = "Discord bot is already running in voice channel";
            logger.error(errorMsg);
            await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, true, {
                updateDescription: errorMsg
            });
            return;
        }


        if (!pathHelper.checkIfPlaylistExists(playlistName)) {
            errorMsg = "Could not find playlist " + playlistName;
            logger.error(errorMsg);
            await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, true, {
                updateDescription: errorMsg
            });
            return;
        }

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            errorMsg = "Could not find voice channel";
            logger.error(errorMsg);
            await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, true, {
                updateDescription: errorMsg
            });
            return;
        }
        
        const musicPaths = pathHelper.retrieveMusicPathsByPlaylist(playlistName);

        if (musicPaths && musicPaths.length > 0) {
             await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, false, {
                updateDescription: "Found playlist " + playlistName + " which has " + musicPaths.length + " musics.",
                updateTitle: "Playlist " + playlistName
            });


            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            if (!connection) {
                errorMsg = "Could not establish connection between bot and voice channel.";
                logger.error(errorMsg);
                await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, true, {
                    updateDescription: errorMsg
                });
                return;
            }

            initializeAudioPlayer(embedPlaylistMessage, connection, musicPaths);
        }
    }
}


function initializeAudioPlayer(embedPlaylistMessage, connection, musicPaths) {
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
            return await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, false, {
                updateDescription: "Audio player finished playing last music"
            }, {
                isLastMusicPlayed: true
            });
        }
        
        audio.volume.setVolume(playlist.getVolume());
        audioPlayer.play(audio);
    });

    audioPlayer.on(AudioPlayerStatus.Playing, async () => {
         await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, false, {
            updateField: [
                {
                    name: "Currently Playing",
                    value: audio.metadata.title
                },
                {
                    name: "Music Position",
                    value: audio.metadata.position + "/" + audio.metadata.totalMusics
                },
                {
                    name: "Prev Music",
                    value: audio.metadata.prevMusic
                },
                {
                    name: "Next Music",
                    value: audio.metadata.nextMusic
                },
                {
                    name: "Volume",
                    value: (playlist.getVolume() * 100).toString() + "/100"
                }
            ]
        }, embedHelper.prepareButtonOptions(playlist, audioPlayer.state.status));
    });

    buttonEventHelper.loadButtonEventListeners(audioPlayer, playlist, embedPlaylistMessage, connection);
}

