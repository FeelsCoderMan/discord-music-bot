const { AudioPlayerStatus } = require("@discordjs/voice");
const constants = require("../constants");

function ButtonOptions() {
    this.disablePrev = false;
    this.disableNext = false;
    this.disablePause = false;
    this.disableStop = false;
    this.disableMore = false;
    this.disableVolumeUp = false;
    this.disableVolumeDown = false;
    this.disableShuffle = false;
    this.isLastMusicPlayed = false;
    this.isMoreButtonClicked = false;
}

ButtonOptions.prototype.updateButtonOptions = function (playlist, audioPlayerState) {
    let atFirst = playlist.atFirst();
    let atLast = playlist.atLast();
    let isPaused = audioPlayerState === AudioPlayerStatus.Paused;
    let isMoreButtonClicked = playlist.getMoreButtonClicked();
    let volume = playlist.getVolume();
    let isVolumeMax = volume === constants.volume.max;
    let isVolumeMin = volume === constants.volume.min;

    if (!atLast && this.isLastMusicPlayed) {
        this.isLastMusicPlayed = false;
    }

    this.disablePrev = atFirst || isPaused;
    this.disableNext = atLast || isPaused || this.isLastMusicPlayed;
    this.disablePause = this.isLastMusicPlayed;
    this.disableStop = this.isLastMusicPlayed;
    this.disableMore = this.isLastMusicPlayed;
    this.disableVolumeUp = isVolumeMax;
    this.disableVolumeDown = isVolumeMin;
    this.isMoreButtonClicked = isMoreButtonClicked;
}

ButtonOptions.prototype.updateButtonOptionsIfLastMusicPlayed = function () {
    this.disablePrev = false;
    this.disableNext = true;
    this.disablePause = true;
    this.disableStop = true;
    this.disableMore = true;
    this.isLastMusicPlayed = true;
    this.isMoreButtonClicked = false;
}

module.exports = ButtonOptions;
