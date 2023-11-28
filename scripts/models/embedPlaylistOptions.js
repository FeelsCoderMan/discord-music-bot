function EmbedPlaylistOptions() {
    this.description = null;
    this.fields = [];
    this.title = null;
}

EmbedPlaylistOptions.prototype.setDescription = function (description) {
    if (description) {
        this.description = description;
    }
}

EmbedPlaylistOptions.prototype.setTitle = function (title) {
    if (title) {
        this.title = title;
    }
}

EmbedPlaylistOptions.prototype.addField = function (obj) {
    if (obj && obj.name && obj.value) {
        this.fields.push({
            name: obj.name,
            value: obj.value.toString()
        });
    }
}

module.exports = EmbedPlaylistOptions;
