const fs = require("fs");
const path = require("path");
const { Collection } = require("discord.js");

const constants = require("../constants");
const logger = require("../logger");

/**
 * Loading commands to the server
 * @param {import("discord.js").Client} client
 */
function loadCommands(client) {
    client.commands = new Collection();

    const commandsPath = path.join(__basedir, constants.directory.commandDir);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
    logger.logMainProcess("Started loading commands");

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if (Object.prototype.hasOwnProperty.call(command, "data") && Object.prototype.hasOwnProperty.call(command, "execute")) {
            logger.info("Command " + command.data.name + " is successfully loaded.");
            client.commands.set(command.data.name, command);
        } else {
            logger.warn("The command at " + filePath + " is missing a required 'data' or 'execute' property.");
        }
    }

    logger.logMainProcess("Finished loading commands");
}

/**
 * Loading events to the server
 *
 * @param {import("discord.js").Client} client
 */
function loadEvents(client) {
    const eventsPath = path.join(__basedir, constants.directory.eventDir);
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

    logger.logMainProcess("Started loading events");

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }

        logger.info("Event " + event.name + " is successfully loaded.");
    }

    logger.logMainProcess("Finished loading events");
}

module.exports = {
    loadCommands: loadCommands,
    loadEvents: loadEvents,
}
