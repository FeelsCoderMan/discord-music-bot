const { createAudioPlayer,createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require("@discordjs/voice");
const { SlashCommandBuilder } = require("discord.js");

const logger = require("../scripts/logger");
const pathHelper = require("../scripts/pathHelper");
const embedHelper = require("../scripts/embedHelper");
const constants = require("../scripts/constants");
const playlistModel = require("../scripts/models/playlist");

const EnumAudioSelection = {
    prev: "prev",
    next: "next",
    curr: "curr"
};

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
                updateDescription:"Found playlist " + playlistName + " which has " + musicPaths.length + " songs."
            });

            const audioPlayer = createAudioPlayer();
            audioPlayer.on("error", error => {
                logger.error("Error: " + error.message + " with track " + error.resource.metadata.title);
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

            connection.subscribe(audioPlayer);

            const playlist = playlistModel.init();
            playlist.setPlaylist(musicPaths);

            let audio = createAudioResourceByMusicPath(playlist, EnumAudioSelection.curr);

            audioPlayer.play(audio);

            audioPlayer.on(AudioPlayerStatus.Idle, () => {
                audio = createAudioResourceByMusicPath(playlist, EnumAudioSelection.next);
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
                        }
                    ]
                }, prepareButtonOptions(playlist, audioPlayer.state.status));
            });

            audioPlayer.on(constants.buttonId.prev, () => {
                audio = createAudioResourceByMusicPath(playlist, EnumAudioSelection.prev);
                audioPlayer.play(audio);
                audioPlayer.emit(AudioPlayerStatus.Playing);
            });

            audioPlayer.on(constants.buttonId.next, () => {
                audioPlayer.emit(AudioPlayerStatus.Idle);
            });

            audioPlayer.on(constants.buttonId.pause, async () => {
                let statusMsg;

                if (audioPlayer.state.status === AudioPlayerStatus.Paused) {
                    let isUnpaused = audioPlayer.unpause();

                    if (isUnpaused) {
                        statusMsg = "Audio player is unpaused.";
                        logger.info(statusMsg);
                    } else {
                        statusMsg = "Audio player could not be unpaused.";
                        logger.warn(statusMsg);
                    }
                    
                    return await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, false, {
                        updateDescription: statusMsg
                    }, prepareButtonOptions(playlist, audioPlayer.state.status));
                }

                let isPaused = audioPlayer.pause();

                if (isPaused) {
                    statusMsg = "Audio player is paused.";
                    logger.info(statusMsg);
                } else {
                    statusMsg = "Audio player could not be paused.";
                    logger.warn(statusMsg);
                }

                return await embedHelper.updateEmbedPlaylistByOptions(embedPlaylistMessage, false, {
                    updateDescription: statusMsg
                }, prepareButtonOptions(playlist, audioPlayer.state.status));

            });

            audioPlayer.on(constants.buttonId.stop, () => {
                audioPlayer.stop();
                embedPlaylistMessage.delete();
                connection.destroy();
            });
        }
    }
}

function createAudioResourceByMusicPath(playlist, enumAudioSelection) {
    const metadataObj = {
        metadata: {
            title: "",
            position: "",
            totalMusics: "",
            prevMusic: "",
            nextMusic: ""
        }
    }
    let musicPath;

    switch (enumAudioSelection) {
        case EnumAudioSelection.curr:
            musicPath = playlist.curr();
            break;
        case EnumAudioSelection.prev:
            musicPath = playlist.prev();
            break;
        case EnumAudioSelection.next:
            musicPath = playlist.next();
            break;

    }

    const musicTitle = musicPath.match(/\/\d+\.(.*?)\.mp3/);
    
    if (musicTitle && musicTitle.length > 1) {
        metadataObj.metadata.title = musicTitle[1]
            .split(constants.regex.musicDelimiter)
            .filter(el => el.length > 0)
            .join(" ");
        metadataObj.metadata.position = playlist.getCurrentPosition();
        metadataObj.metadata.totalMusics = playlist.getTotalMusics();
        metadataObj.metadata.prevMusic = getMusicTitleFromMusicPath(playlist.showPrev()) || "Nothing prev in queue";
        metadataObj.metadata.nextMusic = getMusicTitleFromMusicPath(playlist.showNext()) || "Nothing next in queue";
    }

    return createAudioResource(musicPath, metadataObj);
}

function getMusicTitleFromMusicPath(musicPath) {
    if (!musicPath) {
        return null;
    }

    const musicTitle = musicPath.match(/\/\d+\.(.*?)\.mp3/);

    if (musicTitle && musicTitle.length > 1) {
        return musicTitle[1]
            .split(constants.regex.musicDelimiter)
            .filter(el => el.length > 0)
            .join(" ");
    }

    return null;
}

function prepareButtonOptions(playlist, audioPlayerState) {
    return {
        atFirst: playlist.atFirst(),
        atLast: playlist.atLast(),
        isPaused: audioPlayerState === AudioPlayerStatus.Paused
    };
}
