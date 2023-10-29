const path = require("path");
const fs = require("fs");

const constants = require("./scripts/constants");
const logger = require("./scripts/logger");
const { REST, Routes } = require("discord.js");
require("dotenv").config();

const env = process.env;
const clientId = env.CLIENT_ID;
const guildId = env.GUILD_ID;
const token = env.DISCORD_TOKEN;

/**
 * Deploys commands to the server.
 * Commands can be found in commands directory.
 */
function deployCommands() {
    if (!token) {
        logger.error("DISCORD_TOKEN is missing on .env file.");
        return;
    } else if (!clientId) {
        logger.error("CLIENT_ID is missing on .env file.");
        return;
    } else if (!guildId) {
        logger.error("GUILD_ID is missing on .env file.");
        return;
    }

    const commands = [];
    const commandsPath = path.join(__dirname, constants.directory.commandDir);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if (Object.prototype.hasOwnProperty.call(command, "data") && Object.prototype.hasOwnProperty.call(command, "execute")) {
            commands.push(command.data.toJSON());
        } else {
            logger.warn("The command at ${filePath} is missing a required 'data' or 'execute' property.");
        }
    }

    const rest = new REST({ version: "10" }).setToken(token);

    (async () => {
        try {
            logger.info("Started pushing " + commands.length + " commands to the server.");

            const updatedCommands = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                {
                    body: commands
                },
            );

            logger.info("Successfully reloaded " + updatedCommands.length + " commands.");
        } catch (error) {
            logger.error(error);
        }
    })();
}

deployCommands();
