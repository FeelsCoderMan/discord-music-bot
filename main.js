const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const { loadEvents, loadCommands } = require("./scripts/loadHelper");
const logger = require("./scripts/logger");
global.__basedir = __dirname;

function initBot() {
    const token = process.env.DISCORD_TOKEN;

    if (!token) {
        logger.error("DISCORD_TOKEN is missing on .env file.");
        return;
    }

    const client = new Client({ intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates
    ]});

    loadCommands(client);
    loadEvents(client);

    client.login(token);
}

initBot();
