const { Events } = require("discord.js");
const logger = require("../scripts/logger");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        logger.info("Ready! Logged in as " + client.user.tag);
    },
}
