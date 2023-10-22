module.exports = {
    init() {
        this.idx = 0;
        return this;
    },
    setPlaylist(arr) {
        this.playlist = arr;
        this.playlistLen = arr.length;
    },
    curr() {
        if (this.idx < this.playlistLen) {
            return this.playlist[this.idx];
        }
    },
    next() {
        if (this.idx < this.playlistLen - 1) {
            this.idx++;
            return this.playlist[this.idx];
        }
    },
    prev() {
        if (this.idx > 0) {
            this.idx--;
            return this.playlist[this.idx];
        }
    },
    atFirst() {
        return this.idx === 0;
    },
    atLast() {
        return this.idx === this.playlistLen - 1;
    },
    showNext() {
        if (this.idx < this.playlistLen - 1) {
            return this.playlist[this.idx + 1];
        }
        
        return null;
    },
    showPrev() {
        if (this.idx > 0) {
            return this.playlist[this.idx - 1];
        }

        return null;
    },
    getTotalMusics() {
        return this.playlistLen;
    },
    getCurrentPosition() {
        return this.idx + 1;
    }
}
