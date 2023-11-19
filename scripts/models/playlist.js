const constants = require("../constants");

/**
 * Initializes Playlist object.
 * @typedef {Object} Playlist
 * @property {string} idx - index of the current music path
 * @property {string[]} playlist - array of music paths
 * @property {number} playlistLen - number of musics that playlist has
 * @property {boolean} isMoreButtonClicked - true if button id of more is clicked, false otherwise
 */
function Playlist() {
    this.idx = 0;
    this.playlist = [];
    this.playlistLen = this.playlist.length;
    this.isMoreButtonClicked = false;
    this.volume = constants.volume.initial;
}


/**
 * Randomizes the playlist
 */
Playlist.prototype.shuffle = function () {
    let currentIdx = this.playlistLen;

    while (currentIdx > 0) {
        let randomIdx = Math.floor(Math.random() * currentIdx);
        currentIdx--;

        let tempVal = this.playlist[currentIdx];
        this.playlist[currentIdx] = this.playlist[randomIdx];
        this.playlist[randomIdx] = tempVal;
    }

    this.idx = 0;
}

/**
 * Returns volume field of the playlist
 */
Playlist.prototype.getVolume = function () {
    return this.volume;
}

/**
 * Updates volume fields of the playlist
 *
 * @param {number} volume
 */
Playlist.prototype.setVolume = function (volume) {
    if (volume > constants.volume.max) {
        this.volume = constants.volume.max
    } else if (volume < constants.volume.min) {
        this.volume = constants.volume.min
    } else {
        this.volume = volume;
    }
}

/**
 * Returns isMoreButtonClicked field of the playlist
 * @return {boolean} state of button id of more
 */
Playlist.prototype.getMoreButtonClicked = function () {
    return this.isMoreButtonClicked;
}

/**
 * Updates isMoreButtonClicked fields of the playlist
 *
 * @param {boolean} val - state of button id of more
 */
Playlist.prototype.setMoreButtonClicked = function (val) {
    this.isMoreButtonClicked = val;
}

/**
 * Sets both playlist and playlistLen attributes of Playlist object.
 * @param {string[]} arr
 */
Playlist.prototype.setPlaylist = function (arr) {
    this.playlist = arr;
    this.playlistLen = arr.length;
}

/**
 * Gets current music path from Playlist.
 * @return {string | null}
 */
Playlist.prototype.curr = function () {
    if (this.idx < this.playlistLen) {
        return this.playlist[this.idx];
    }

    return null;
}


/**
 * Moves back to the previous music path.
 * @return {[MusicPath | null]}
 */
Playlist.prototype.prev = function () {
    if (this.idx > 0) {
        this.idx--;
        return this.playlist[this.idx];
    }

    return null;
}

/**
 * Moves to next music path.
 * @return {string | null}
 */
Playlist.prototype.next = function () {
    if (this.idx < this.playlistLen - 1) {
        this.idx++;
        return this.playlist[this.idx];
    }

    return null;
}

/**
 * Checks if Playlist is at first music.
 * @return {boolean}
 */
Playlist.prototype.atFirst = function () {
    return this.idx == 0;
}

/**
 * Checks if Playlist is at last music.
 * @return {boolean}
 */
Playlist.prototype.atLast = function () {
    return this.idx == this.playlistLen - 1;
}

/**
 * Gets next music path from Playlist.
 * @return {string | null}
 */
Playlist.prototype.showNext = function () {
    if (this.idx < this.playlistLen - 1) {
        return this.playlist[this.idx + 1];
    }

    return null;
}

/**
 * Gets previous music path from Playlist.
 * @return {string | null}
 */
Playlist.prototype.showPrev = function () {
    if (this.idx > 0) {
        return this.playlist[this.idx - 1];
    }

    return null;
}

/**
 * Gets total number of musics that Playlist has.
 * @return {number}
 */
Playlist.prototype.getTotalMusics = function () {
    return this.playlistLen;
}


/**
 * Get index of current music path from Playlist
 * @return {number}
 */
Playlist.prototype.getCurrentPosition = function () {
    return this.idx + 1;
}

module.exports = Playlist;
