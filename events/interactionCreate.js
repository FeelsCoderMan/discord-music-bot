const { Events } = require("discord.js");
const logger = require("../scripts/logger");
const buttonEventHelper = require("../scripts/helpers/buttonEventHelper");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                logger.error("No command matching " + interaction.commandName + " was found.");
                return;
            }

            await interaction.reply({
                content: "Command " + interaction.commandName + " is triggered.",
                ephemeral: true
            });

            logger.info("Command " + interaction.commandName + " is triggered.");
            try {
                await command.execute(interaction);
            } catch (error) {
                logger.error(error);
            }
        } else if (interaction.isButton()) {
            buttonEventHelper.handleButtonEvent(interaction);
        }

    }
}
