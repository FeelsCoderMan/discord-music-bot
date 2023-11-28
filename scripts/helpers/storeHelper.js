/**
 * updates embed message that is stored in global object.
 *
 * @param {import("discord.js").Message} embedPlaylistMessage
 * @param {string} commandName
 */
function storeUpdatedEmbedPlaylistMessageToGlobal(embedPlaylistMessage, commandName) {
    if (embedPlaylistMessage && commandName) {
        global.message[commandName] = embedPlaylistMessage;
    }
}

module.exports = {
    storeUpdatedEmbedPlaylistMessageToGlobal: storeUpdatedEmbedPlaylistMessageToGlobal,
}
