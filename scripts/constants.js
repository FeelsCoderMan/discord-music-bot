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
        baseYoutubeUrl: "https://www.youtube.com"
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
        pause: "paus"

    }
}
