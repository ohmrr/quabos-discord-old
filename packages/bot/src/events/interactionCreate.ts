import type Command from '../interfaces/command.js';
import createEvent from '../interfaces/event.js';
import { utilEmojis } from '../utils/emoji.js';
import handleCooldown from '../utils/handleCooldown.js';
import logger from '../utils/logger.js';

export default createEvent('interactionCreate', false, async interaction => {
	let command: Command | undefined;

	if (interaction.isChatInputCommand()) {
		command = interaction.client.commands.get(interaction.commandName);
		if (!command) return;

		const hasCooldown = await handleCooldown(interaction, command);
		if (hasCooldown) return;

		try {
			await command.execute(interaction);
		} catch (error) {
			logger.error({ err: error, command }, `${utilEmojis.error} Unable to execute slash command.`);
			await interaction.reply({
				content: `${utilEmojis.error} There was an error executing the slash command`,
				flags: 'Ephemeral',
			});
		}
	}

	if (interaction.isAutocomplete()) {
		command = interaction.client.commands.get(interaction.commandName);
		if (!command || !command.autocomplete) return;

		try {
			await command.autocomplete(interaction);
		} catch (error) {
			logger.error(
				{ err: error, command },
				`${utilEmojis.error} Unable to execute autocomplete command.`,
			);
		}
	}
});
