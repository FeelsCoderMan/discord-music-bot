const { getVoiceConnection } = require("@discordjs/voice");
const logger = require("./logger");

async function handleButtonEvent(interaction) {
    const buttonId = interaction.customId;

    if (!buttonId) {
        logger.error("Button id does not exist.");
        return;
    }

    logger.info("Button " + buttonId + " is triggered.")
    
    const connection = getVoiceConnection(interaction.guildId);

    if (connection) {
        const subscription = connection.state.subscription;
        
        if (subscription) {
            const currentAudioPlayer = subscription.player;

            if (currentAudioPlayer) {
                await interaction.deferUpdate();
                currentAudioPlayer.emit(buttonId);
            }
        }
    }


}

module.exports = {
    handleButtonEvent: handleButtonEvent
}
