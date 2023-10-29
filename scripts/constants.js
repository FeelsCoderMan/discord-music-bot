module.exports = {
    directory: {
        commandDir: "commands",
        eventDir: "events",
        musicDir: "musics"
    },
    fileExtensions: {
        video: ".mp4",
        audio: ".mp3"
    },
    url: {
        baseYoutubeUrl: "https://www.youtube.com",
        baseYoutubeUrlExceptW3: "https://youtube.com"
    },
    endPoints: {
        playList: "/playlist"
    },
    regex: {
        musicTitle: "[!\"#$%&'()*+,-\-./:;<=>?@\[\\\]^_~`{|}~]",
        musicDelimiter: "_"
    },
    buttonId: {
        prev: "prev",
        next: "next",
        stop: "stop",
        pause: "paus",
        more: "more",
        volumeUp: "volu",
        volumeDown: "vold"
    },
    enumAudioSelection: {
        prev: "prev",
        next: "next",
        curr: "curr"
    },
    playlistSelector: "#wc-endpoint",
    volume: {
        initial: 0.5,
        max: 1,
        min: 0
    }
}
